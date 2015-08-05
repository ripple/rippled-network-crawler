'use strict';
var Crawler = require('./lib/crawler.js').Crawler;
var _ = require('lodash');
var src = require('./program');
var Promise = require('bluebird');

module.exports = function(ipp, commander) {
  return new Promise(function(resolve, reject) {
    var logger = commander.quiet ? {log: _.noop, error: _.noop} : console;
    var maxRequests = commander.max ? parseInt(commander.max, 10) : 100;
    var crawler = new Crawler(maxRequests, logger);
    crawler.getCrawl(ipp)
      .then(function(response) {
        if (commander.store) {
          src
          .store(response, commander.store, commander.logsql)
          .then(resolve)
          .catch(reject);
        } else if (commander.readable) {
          console.log(JSON.stringify(response, null, 4));
        } else {
          console.log(JSON.stringify(response));
        }
      })
      .catch(function(error) {
        console.error('error:', error.message);
        reject(error);
      });
  });
};
