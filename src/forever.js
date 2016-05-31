'use strict';
var src = require('./program');
var Promise = require('bluebird');

function callPrior(dbUrl, commander, lastCrawl) {
  var delay = commander.delay || 0;

  src
  .prior(dbUrl, commander, lastCrawl)
  .delay(delay * 1000)
  .then(function(crawl) {
    process.nextTick(function() {
      callPrior(dbUrl, commander, crawl.data);
    });
  })
  .catch(function(err) {
    console.log(err);
  });
}

module.exports = function(ipp, dbUrl, commander) {
  return new Promise(function(resolve, reject) {
    src
    .enter(ipp, commander)
    .then(function(crawl) {
      callPrior(dbUrl, commander, crawl.data);
    })
    .catch(reject);
  });
};
