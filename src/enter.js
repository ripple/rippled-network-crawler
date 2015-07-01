'use strict';
var Crawler = require('./lib/crawler.js').Crawler;
var _ = require('lodash');
var src = require('./program');

module.exports = function(ipp, commander) {
  var logger = commander.quiet ? {log: _.noop, error: _.noop} : console;
  var maxRequests = commander.max ? parseInt(commander.max, 10) : 100;
  var crawler = new Crawler(maxRequests, logger);
  crawler.getCrawl(ipp)
    .then(function(response) {
      if (commander.dbUrl) {
        src.store(response, commander.dbUrl, commander.logsql);
      } else if (commander.readable) {
        console.log(JSON.stringify(response, null, 4));
      } else {
        console.log(JSON.stringify(response));
      }
    })
    .catch(function(error) {
      console.error('error:', error.message);
    });
};