'use strict';
var src = require('./program');
var Promise = require('bluebird');

function callPrior(commander, lastCrawl) {
  src
  .prior(commander, lastCrawl)
  .then(function(crawl) {
    process.nextTick(function() {
      callPrior(commander, crawl.data);
    });
  })
  .catch(function(err) {
    console.log(err);
  });
}

module.exports = function(ipp, commander) {
  return new Promise(function(resolve, reject) {
    commander.store = true;  // turning on -s flag.
    src
    .enter(ipp, commander)
    .then(function(crawl) {
      callPrior(commander, crawl.data);
    })
    .catch(reject);
  });
};
