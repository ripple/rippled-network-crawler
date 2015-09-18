'use strict';
var rc_util = require('./lib/utility.js');
var selective = require('./program').selective;
var Promise = require('bluebird');
var HbaseClient = require('crawler-hbase').Client;

module.exports = function(dbUrl, commander, lastCrawl) {
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
      var hbaseClient = new HbaseClient(dbUrl);
      hbaseClient.getLatestRawCrawl()
      .then(function(row) {
        useLatestCrawl(JSON.parse(row.data));
      })
      .catch(reject);
    }
  });
};
