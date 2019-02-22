const https = require('https');
const BigNumber = require('bignumber.js');
const moment = require('moment');
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    requestCert: true
  })
});

const EPOCH_OFFSET = 946684800
const DEFAULT_PORT = 51235;
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

const getServerInfo = info => info ? {
  pubkey_node: info.pubkey_node,
  hostid: info.hostid,
  server_state: info.server_state,
  last_close: info.last_close,
  state_accounting: formatStateAccounting(info.state_accounting),
  ledgers: info.complete_ledgers,
  latency: info.io_latency_ms,
  load_factor: info.load_factor,
  load_factor_server: info.load_factor_server,
  peers: info.peers,
  peer_disconnects: Number(info.peer_disconnects),
  peer_disconnects_resources: Number(info.peer_disconnects_resources),
  validated_ledger: info.validated_ledger ? {
    ledger_index: info.validated_ledger.seq,
    ledger_hash: info.validated_ledger.hash,
    close_time: moment.unix(info.validated_ledger.close_time + EPOCH_OFFSET).utc().format()
  } : undefined,
  amendment_blocked: info.amendment_blocked,
  quorum: info.validation_quorum,
  version: info.build_version,
  uptime: info.uptime
} : undefined;

module.exports = (host, port = DEFAULT_PORT) =>
  axios.get(`https://[${host}]:${port}/crawl`, { timeout: TIMEOUT })
    .then(response => ({
      server: getServerInfo(response.data.server),
      peers: response.data.overlay.active
    }));
