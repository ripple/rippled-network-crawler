const crawlNodes = require('./src/crawlNodes');
const geolocateNodes = require('./src/geolocateNodes');
const save = require('./src/saveCrawl');
const config = require('./src/config');
const log = require('./src/logger');
const TIMEOUT = 120 * 1000;
const INTERVAL = 60 * 60 * 1000;
const INTERVAL2 = INTERVAL * 24 * 7;

const geolocate = () => {
  geolocateNodes().catch(log.error);
}

const recursiveCrawl = () => {
  crawlNodes(config.get('entry'))
  .then(save)
  .then(() => {
    setTimeout(recursiveCrawl, TIMEOUT);
  })
  .catch(error => {
    log.error(error);
    log.info('failed to record crawl');
    setTimeout(recursiveCrawl, TIMEOUT);
  });
}

recursiveCrawl();
geolocate();
setInterval(geolocate, INTERVAL);
setInterval(geolocate.bind(null, true), INTERVAL2);

