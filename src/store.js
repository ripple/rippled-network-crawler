'use strict';
var DB = require('./lib/database');
var modelsFactory = require('./lib/models.js');
var Promise = require('bluebird');
var moment = require('moment');

function saveDB(crawlJson, dbUrl, logsql) {
  var log = logsql ? console.log : false;
  var sql = DB.initSql(dbUrl, log);
  return modelsFactory(sql).then(function(models) {
    return models.Crawl.create({start_at: crawlJson.start,
                                end_at: crawlJson.end,
                                entry_ipp: crawlJson.entry,
                                data: JSON.stringify(crawlJson.data),
                                exceptions: JSON.stringify(crawlJson.errors)});
  });
}

module.exports = function(crawl, dbUrl, logsql) {
  return new Promise(function(resolve, reject) {
    saveDB(crawl, dbUrl, logsql)
    .then(function(row) {
      console.log('Stored crawl %d (%s) \t at %s \t to %s',
              row.id, moment(crawl.start).format(), moment().format(), dbUrl);
      resolve(row);
    })
    .catch(function(err) {
      console.error(err);    // this is a serious error
      process.exit(1);
    });
  });
};
