const crawlNodes = require('./src/crawlNodes');
const save = require('./src/saveCrawl');
const config = require('./src/config');
const log = require('./src/logger');
const TIMEOUT = 120 * 1000;

const recursiveCrawl = () => {
  crawlNodes(config.get('entry'))
  .then(save)
  .then(() => {
    setTimeout(recursiveCrawl, TIMEOUT);
  })
  .catch(error => {
    log.error(error);
    setTimeout(recursiveCrawl, TIMEOUT);
  });
}

recursiveCrawl();

