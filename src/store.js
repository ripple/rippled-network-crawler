'use strict';
var DB = require('./lib/database');
var modelsFactory = require('./lib/models.js');
var Promise = require('bluebird');
var moment = require('moment');

function saveDB(crawlJson, logsql) {
  var log = logsql ? console.log : false;
  var sql = DB.initSql(log);
  return modelsFactory(sql).then(function(models) {
    return models.Crawl.create({start_at: crawlJson.start,
                                end_at: crawlJson.end,
                                entry_ipp: crawlJson.entry,
                                data: JSON.stringify(crawlJson.data),
                                exceptions: JSON.stringify(crawlJson.errors)});
  });
}

module.exports = function(crawl, logsql) {
  return new Promise(function(resolve, reject) {
    saveDB(crawl, logsql)
    .then(function(row) {
      console.log('Stored crawl %d (%s) \t at %s \t',
              row.id, moment(crawl.start).format(), moment().format());
      resolve(row);
    })
    .catch(function(err) {
      console.error(err);    // this is a serious error
      process.exit(1);
    });
  });
};
