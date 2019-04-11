const moment = require('moment');
const ripple = require('ripple-address-codec');
const queryCrawl = require('./queryCrawl');
const queryServerInfo = require('./queryServerInfo');
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

    if (d.complete_ledgers && !nodes[peer].ledgers) {
      nodes[peer].ledgers = d.complete_ledgers;
    }

    nodes[peer].uptime = d.uptime;
    nodes[peer].host = d.ip || nodes[peer].host;
    nodes[peer].port = d.port || nodes[peer].port;
  });
}

const queryNode = async (pubkey, nodes) => {
  const { host, port } = nodes[pubkey];
  nodes[pubkey].done = true;

  if (!host) {
    return Promise.resolve(); // nothing to query
  }

  try {
    const data = await queryCrawl(host, port);
    const server = data.server || await queryServerInfo(host);
    Object.assign(nodes[server.pubkey_node], server);
    handlePeers(pubkey, data.peers, nodes);

  } catch(e) {
    log.debug(e.toString());
  }
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

  return tasks.length
    ? Promise.all(tasks).then(queryNewNodes.bind(this, nodes))
    : Promise.resolve(nodes);
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

module.exports = async (host, port) => {
  const start = moment.utc().format(TIME_FORMAT);
  log.info(`starting topology crawl at ${start}`)

  const nodes = {};
  const data = await queryCrawl(host, port);
  const server = data.server || await queryServerInfo(host);

  if (!server || !server.pubkey_node) {
    throw new Error('unable to query entry host info');
  }

  nodes[server.pubkey_node] = Object.assign({
    host,
    port,
    in: {},
    out: {},
    done: true
  }, server);

  handlePeers(server.pubkey_node, data.peers, nodes);
  await queryNewNodes(nodes);

  const formatted = formatData(nodes);
  formatted.start = start;
  formatted.nodes_count = formatted.nodes.length;
  formatted.connections_count = formatted.connections.length;
  return formatted;
};