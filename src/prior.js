'use strict';
var DB = require('./lib/database');
var rc_util = require('./lib/utility.js');
var modelsFactory = require('./lib/models.js');
var selective = require('./program').selective;
var Promise = require('bluebird');

module.exports = function(commander, lastCrawl) {
  return new Promise(function(resolve, reject) {


    function useLatestCrawl(latestCrawl) {
      var ipps = rc_util.getIpps(latestCrawl);
      if (ipps) {
        selective(ipps, commander)
        .then(resolve)
        .catch(reject);
      }
    }

    if (lastCrawl) {
      useLatestCrawl(lastCrawl);
    } else {
      if (commander.file) {
        rc_util.getCrawlFromFile(commander.file)
        .then(function(crawl) {
          useLatestCrawl(JSON.parse(crawl.data));
        })
        .catch(reject);
      } else if (commander.store) {
        rc_util.getLatestRow(dbUrl, commander.logsql)
        .then(function(row) {
          useLatestCrawl(JSON.parse(row.data));
        })
        .catch(reject);
      } else {
        reject("Needs either -f or -s as source of previous crawl");
      }
    }
  });
};
