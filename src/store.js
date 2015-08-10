'use strict';
var DB = require('./lib/database');
var modelsFactory = require('./lib/models.js');
var Promise = require('bluebird');

function saveDB(crawlJson, dbUrl, logsql) {
  return new Promise(function(resolve, reject) {
    var log = logsql ? console.log : false;
    var sql = DB.initSql(dbUrl, log);
    var models = modelsFactory(sql);

    sql
    .sync({force: false})
    .then(function() {
      models.Crawl.create({start_at: crawlJson.start,
                                  end_at: crawlJson.end,
                                  entry_ipp: crawlJson.entry,
                                  data: crawlJson.data,
                                  exceptions: crawlJson.errors});
    })
    .then(resolve)
    .catch(function(err){
      console.error(err);    // this is a serious error
      process.exit(1);
    });
  });
}

module.exports = function(crawl, dbUrl, logsql) {
  return new Promise(function(resolve, reject) {
    saveDB(crawl, dbUrl, logsql)
    .then(function() {
      console.log("Stored data crawled at: " + crawl.start);
      resolve(crawl);
    })
    .catch(reject);
  });
};
