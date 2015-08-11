'use strict';
var DB = require('./lib/database');
var modelsFactory = require('./lib/models.js');
var Promise = require('bluebird');

function saveDB(crawlJson, dbUrl, logsql) {
  var log = logsql ? console.log : false;
  var sql = DB.initSql(dbUrl, log);
  var models = modelsFactory(sql);
  return models.Crawl.create({start_at: crawlJson.start,
                                end_at: crawlJson.end,
                                entry_ipp: crawlJson.entry,
                                data: JSON.stringify(crawlJson.data),
                                exceptions: JSON.stringify(crawlJson.errors)});
  }).then(function() {
    onDone();
  })
  .catch(function(error) {
    onDone(error);
  });
}

module.exports = function(crawl, dbUrl, logsql) {
  return new Promise(function(resolve, reject) {
    saveDB(crawl, dbUrl, logsql)
    .then(function() {
      console.log('Stored data crawled at: ' + crawl.start);
      resolve(crawl);
    })
    .catch(function(err) {
      console.error(err);    // this is a serious error
      process.exit(1);
    });
  });
};
