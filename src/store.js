'use strict';
var Sequelize = require('sequelize');
var modelsFactory = require('./lib/models.js');

function saveDB(crawlJson, dbUrl, logsql, onDone) {
  var log = logsql ? console.log : false;
  var sql = new Sequelize(dbUrl, {logging: log,
                                            dialectOptions: {ssl: true}});
  var models = modelsFactory(sql);

  sql
  .sync({force: false})
  .then(function() {
    return models.Crawl.create({start_at: crawlJson.start,
                                end_at: crawlJson.end,
                                entry_ipp: crawlJson.entry,
                                data: crawlJson.data,
                                exceptions: crawlJson.errors});
  }).then(function() {
    onDone();
  })
  .catch(function(error) {
    onDone(error);
  });
}

module.exports = function(crawl, dbUrl, logsql) {
  saveDB(crawl, dbUrl, logsql, function(error) {
    if (error) {
      console.error('Database error:', error.message);
      process.exit(1);
    } else {
      console.error('Saved to database');
      process.exit(0);
    }
  });
};
