const https = require('https');
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    requestCert: true
  })
});

const DEFAULT_PORT = 51235;
const TIMEOUT = 2000;

module.exports = (host, port = DEFAULT_PORT) => {
  return axios.get(`https://${host}:${port}/crawl`, { timeout: TIMEOUT })
  .then(response => response.data.overlay.active);
}