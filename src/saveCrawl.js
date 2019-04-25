const config = require('./config');
const db = require('knex')(config.get('db'));
const log = require('./logger');

module.exports = data => {
  return db('crawls').insert(Object.assign({}, data, {
    nodes: JSON.stringify(data.nodes),
    connections: JSON.stringify(data.connections)
  }))
  .then(() => {
    log.info('network crawl saved');
  });
};
