var _ = require('lodash');
var Crawler = require('./lib/crawler').Crawler;

function newCrawler(maxRequests, logger) {
  return new Crawler(maxRequests, logger);
}

Crawler.prototype.crawl = function(entryIp) {
  var self = this;
  return new Promise(function(resolve, reject){
    self.once('done', function(response) {
      resolve(response)
    }).enter(entryIp)
  })
}

exports.Crawler = newCrawler;