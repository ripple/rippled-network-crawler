'use strict';
var src = require('./program');
var graphite = require('graphite');
var utils = require('./lib/utility.js');
var graphiteClient;

module.exports = function(ipp, dbUrl, commander) {
  console.log("FOREVER: calling ENTER.....")

  if(commander.graphite){
    graphiteClient = graphite.createClient('plaintext://54.91.39.21:2003/');
  }
  
  commander.store = dbUrl;  // turning on -s dbUrl flag.
  src
  .enter(ipp, commander)
  .then(function(crawl){
    callPrior(dbUrl, commander, crawl);
  })
  .catch(function(error){
    console.log("FOREVER: error: ENTER did not finish successfully");
    console.log(error);
  });  
};

function callPrior(dbUrl, commander, lastCrawl){
  console.log("FOREVER: calling PRIOR.....")

  if(commander.graphite && lastCrawl){
    var crawl = lastCrawl.data;
    var metrics = {
      crawler : {
        ippCount : utils.getIpps(crawl).length,
        publicKeyCount : Object.keys(utils.getRippleds(crawl)).length,
        connectionsCount : Object.keys(utils.getLinks(crawl)).length,
      }
    }
    graphiteClient.write(metrics, function(err) {
      console.log(err);
    });
  }

  src
  .prior(dbUrl, commander, lastCrawl)
  .then(function(crawl){
    callPrior(dbUrl, commander, crawl);
  })
  .catch(function(error){
    console.log("FOREVER: error: PRIOR did not finish successfully");
    console.log(error);
  })
}
