'use strict';
var src = require('./program');

function callPrior(dbUrl, commander, lastCrawl) {
  console.log('FOREVER: calling PRIOR.....');
  src
  .prior(dbUrl, commander, lastCrawl)
  .then(function(crawl) {
    callPrior(dbUrl, commander, crawl);
  })
  .catch(function(error) {
    console.log('FOREVER: error: PRIOR did not finish successfully');
    console.log(error);
  });
}

module.exports = function(ipp, dbUrl, commander) {
  console.log('FOREVER: calling ENTER.....');

  commander.store = dbUrl;  // turning on -s dbUrl flag.
  src
  .enter(ipp, commander)
  .then(function(crawl) {
    callPrior(dbUrl, commander, crawl);
  })
  .catch(function(error) {
    console.log('FOREVER: error: ENTER did not finish successfully');
    console.log(error);
  });
};
