const log = require('./logger');
const https = require('https');
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    requestCert: true
  })
});

const TIMEOUT = 2000;

module.exports = host => {
  return axios({
    method: 'post',
    url: `https://${host}:51234`,
    data: { method: 'server_info' },
    timeout: TIMEOUT
  })
  .then(response => response.data.result.info)
  .then(info => ({
    pubkey_node: info.pubkey_node,
    hostid: info.hostid,
    server_state: info.server_state,
    ledgers: info.complete_ledgers,
    latency: info.io_latency_ms,
    load_factor: info.load_factor,
    load_factor_local: info.load_factor_local,
    load_factor_net: info.load_factor_net,
    peers: info.peers,
    amendment_blocked: info.amendment_blocked,
    quorum: info.validation_quorum,
    version: info.build_version,
    uptime: info.uptime
  }))
  .catch(e => {
    log.debug(e.toString());
    return {}
  })
};