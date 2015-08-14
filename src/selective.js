'use strict';
var Crawler = require('./lib/crawler.js').Crawler;
var _ = require('lodash');
var src = require('./program');
var Promise = require('bluebird');

module.exports = function(ipps, commander) {
  return new Promise(function(resolve, reject) {
    var logger = commander.quiet ? {log: _.noop, error: _.noop} : console;
    var maxRequests = commander.max ? parseInt(commander.max, 10) : 100;
    var crawler = new Crawler(maxRequests, logger);
    crawler
    .getSelCrawl(ipps)
    .then(function(response) {
      if (commander.file) {
        src
        .store_f(response, commander.file, commander.logsql)
        .then(resolve)
        .catch(reject);
      }
      if (commander.store) {
        src
        .store_db(response, commander.store, commander.logsql)
        .then(resolve)
        .catch(reject);
      } else if (commander.readable) {
        console.log(JSON.stringify(response, null, 4));
      } else {
        console.log(JSON.stringify(response));
      }
    })
    .catch(reject);
  });
};
