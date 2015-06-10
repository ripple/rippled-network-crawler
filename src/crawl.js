var _ = require('lodash');
var Crawler = require('./lib/crawler').Crawler;

function initCrawler(maxRequests, logger) {
  this.crawler = new Crawler(maxRequests, logger);
}

initCrawler.prototype.crawl = function(entryIp) {
  return new Promise(function(resolve, reject) {
    this.crawler.once('done', function(response) {
      resolve(response)
    }).enter(entryIp)
  })
}

exports.Crawler = initCrawler;