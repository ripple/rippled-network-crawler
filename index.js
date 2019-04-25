require('colors');
const moment = require('moment');
const crawlNodes = require('./src/crawlNodes');
const geolocateNodes = require('./src/geolocateNodes');
const save = require('./src/saveCrawl');
const config = require('./src/config');
const db = require('knex')(config.get('db'));
const log = require('./src/logger');

const CRAWL_INTERVAL = 120 * 1000;
const INTERVAL = 24 * 60 * 60 * 1000;

// geolocate nodes
const geolocate = () => {
  geolocateNodes().catch(log.error);
};

// run crawl
const doCrawl = () => {
  crawlNodes(config.get('entry'))
  .then(save)
  .catch(error => {
    log.error(error);
    log.info('failed to record crawl');
  });
};

// purge old data
const purge = () => {
  const MAX = moment.utc().subtract(90, 'days');
  const TABLES = [ 'crawls', 'location'];

  log.info('purging old data');
  TABLES.forEach(name => {
    const column = name === 'crawls' ? 'start' : 'updated';
    db(name)
      .where(column, '<', MAX)
      .del()
      .then(count => log.info(`${count} '${name}' rows deleted`))
      .catch(log.error);
  });
};

doCrawl();
setInterval(doCrawl, CRAWL_INTERVAL);
setInterval(geolocate, INTERVAL);
setInterval(purge, INTERVAL);
