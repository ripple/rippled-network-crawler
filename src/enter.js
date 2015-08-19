'use strict';
var Crawler = require('./lib/crawler.js').Crawler;
var _ = require('lodash');
var src = require('./program');
var Promise = require('bluebird');

module.exports = function(ipp, commander) {
  return new Promise(function(resolve, reject) {
    var logger = {log: _.noop, error: _.noop}; // no crawler logging for now
    var maxRequests = commander.count ? parseInt(commander.count, 10) : 100;
    var crawler = new Crawler(maxRequests, logger);
    crawler.getCrawl(ipp)
    .then(function(crawl) {
      // Store in database
      if (commander.store) {
        src
        .store(crawl, commander.store, commander.logsql)
        // Send message
        .then(function(row) {
          if (commander.message) {
            src
            .message(row, commander.message)
            //.then(console.log) // todo logQueue option
            .catch(console.error); // message error
          }
        })
        .catch(console.error); // store error
      }
      return crawl;
    })
    .then(resolve) // return crawl
    .catch(reject); // getCrawl error
  });
};
