'use strict';
var src = require('./program');
var Promise = require('bluebird');

function callPrior(commander, lastCrawl) {
  src
  .prior(dbUrl, commander, lastCrawl)
  .then(function(crawl) {
    callPrior(dbUrl, commander, crawl);
  })
  .catch(function(err) {
    console.log(err);
  });
}

module.exports = function(ipps, commander) {
  return new Promise(function(resolve, reject) {
    src
    .enter(ipp, commander)
    .then(function(crawl) {
      callPrior(commander, crawl);
    })
    .catch(reject);
  });
};
