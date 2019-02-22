const log = require('./logger');
const https = require('https');
const BigNumber = require('bignumber.js');
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    requestCert: true
  })
});

const TIMEOUT = 2000;

const formatStateAccounting = data => {
  if (data) {
    const result = {};
    Object.keys(data).forEach(key => {
      result[key] = {
        duration: new BigNumber(data[key].duration_us).dividedBy(1000000).toNumber(),
        transitions: data[key].transitions
      };
    });
    return result;
  }
}

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
    last_close: info.last_close,
    state_accounting: formatStateAccounting(info.state_accounting),
    ledgers: info.complete_ledgers,
    latency: info.io_latency_ms,
    load_factor: info.load_factor,
    load_factor_local: info.load_factor_local,
    load_factor_net: info.load_factor_net,
    peers: info.peers,
    peer_disconnects: Number(info.peer_disconnects),
    peer_disconnects_resources: Number(info.peer_disconnects_resources),
    validated_ledger: info.validated_ledger ? {
      ledger_index: info.validated_ledger.seq,
      ledger_hash: info.validated_ledger.hash,
    } : undefined,
    amendment_blocked: info.amendment_blocked,
    quorum: info.validation_quorum,
    version: info.build_version,
    uptime: info.uptime
  }))
  .catch(e => {
    log.debug(e.toString());
    return undefined;
  })
};