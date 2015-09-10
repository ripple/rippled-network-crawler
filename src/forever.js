'use strict';
var src = require('./program');
var Promise = require('bluebird');

function callPrior(dbUrl, commander, lastCrawl) {
  src
  .prior(dbUrl, commander, lastCrawl)
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
