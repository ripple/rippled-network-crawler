require('colors');
const crawlNodes = require('./src/crawlNodes');
const geolocateNodes = require('./src/geolocateNodes');
const save = require('./src/saveCrawl');
const config = require('./src/config');
const log = require('./src/logger');

const CRAWL_INTERVAL = 120 * 1000;
const INTERVAL = 24 * 60 * 60 * 1000;

const geolocate = () => {
  geolocateNodes().catch(log.error);
}

const doCrawl = () => {
  crawlNodes(config.get('entry'))
  .then(save)
  .catch(error => {
    log.error(error);
    log.info('failed to record crawl');
  });
}

doCrawl();
setInterval(geolocate, INTERVAL);
setInterval(doCrawl, CRAWL_INTERVAL);

