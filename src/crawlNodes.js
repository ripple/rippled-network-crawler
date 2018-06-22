const moment = require('moment');
const ripple = require('ripple-address-codec');
const getNodeInfo = require('./getNodeInfo');
const getNodeConnections = require('./getNodeConnections');
const log = require('./logger');

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss[Z]';
const BATCH_SIZE = 500;
const short = str => str.substr(0, 12);

const normalizePubKey = pubKeyStr => {
  if (pubKeyStr.length > 50 && pubKeyStr[0] === 'n') {
    return pubKeyStr;
  }

  return ripple.encodeNodePublic(Buffer.from(pubKeyStr, 'base64'));
}

const handlePeers = (pubkey, peers, nodes) => {
    peers.forEach(d => {
    const peer = normalizePubKey(d.public_key);

    if (!nodes[peer]) {
      nodes[peer] = {
        host: d.ip,
        port: d.port,
        pubkey_node: peer,
        version: d.version.replace('rippled-', ''),
        uptime: d.uptime,
        in: {},
        out: {}
      };
    }

    if (d.type === 'in') {
      nodes[pubkey].in[peer] = true;
      nodes[peer].out[pubkey] = true;
    } else if (d.type === 'out') {
      nodes[peer].in[pubkey] = true;
      nodes[pubkey].out[peer] = true;
    } else {
      log.info('unknown direction:', d);
    }
  });
}

const queryNode = (pubkey, nodes) => {
  const { host, port } = nodes[pubkey];
  nodes[pubkey].done = true;

  if (!host) {
    return Promise.resolve(); // nothing to query
  }

  const getInfo = nodes[pubkey].time
  ? Promise.resolve()
  : getNodeInfo(host)
    .then(info => {
      if (info.pubkey_node && info.pubkey_node !== pubkey) {
        log.info('key mismatch:', info.pubkey_node, pubkey);
      } else {
        Object.assign(nodes[pubkey], info);
      }
    });

  return getInfo
  .then(() => {
    return getNodeConnections(host, port)
    .then(peers => {
      handlePeers(pubkey, peers, nodes)
    })
  })
  .catch(error => {
    log.debug(error.toString())
  });
};

const queryNewNodes = nodes => {
  const tasks = [];
  const keys = Object.keys(nodes);

  keys.forEach(key => {
    if (!nodes[key].done && tasks.length < BATCH_SIZE) {
      tasks.push(queryNode(key, nodes));
    }
  });

  log.info(`# nodes found: ${keys.length}`);
  log.info(`# nodes to query: ${tasks.length}`);

  if (!tasks.length) {
    return nodes;
  }

  return Promise.all(tasks)
  .then(queryNewNodes.bind(this, nodes));
}

const formatData = (data) => {
  const nodes = [];
  const connections = {};

  Object.entries(data).forEach(d => {
    const pubkey = short(d[1].pubkey_node);
    const inbound = Object.keys(d[1].in);
    const outbound = Object.keys(d[1].out);

    inbound.forEach(peer => {
      connections[`${pubkey}>${short(peer)}`] = true;
    });

    outbound.forEach(peer => {
      connections[`${short(peer)}>${pubkey}`] = true;
    });

    nodes.push(Object.assign({}, d[1], {
      in: inbound.length,
      out: outbound.length,
      done: undefined // remove
    }));
  })

  return {
    nodes,
    connections: Object.keys(connections),
    end: moment.utc().format(TIME_FORMAT)
  }
}

module.exports = (host, port) => {
  const start = moment.utc().format(TIME_FORMAT);
  log.info(`starting topology crawl at ${start}`)
  return getNodeInfo(host)
  .then(info => {

    if (!info.pubkey_node) {
      throw new Error('unable to query entry host info');
    }

    const nodes = {};
    nodes[info.pubkey_node] = Object.assign({
      host,
      port,
      in: {},
      out: {}
    }, info);

    return queryNewNodes(nodes)
  })
  .then(formatData)
  .then(data => {
    data.start = start;
    data.nodes_count = data.nodes.length;
    data.connections_count = data.connections.length;
    return data;
  })
};