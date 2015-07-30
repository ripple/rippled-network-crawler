'use strict';
var DB = require('./lib/database');
var modelsFactory = require('./lib/models.js');
var Promise = require('bluebird');

function saveDB(crawlJson, dbUrl, logsql, onDone) {
  var log = logsql ? console.log : false;
  var sql = DB.initSql(dbUrl, log);
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

module.exports = function(crawl, dbUrl, logsql, cb) {
  return new Promise(function(resolve, reject){
    saveDB(crawl, dbUrl, logsql, function(error) {
      if (error) {
        console.error('Database error:', error.message);
        reject(error);
      } else {
        console.log('Saved to database');
        resolve();
      }
    });
  });
};
