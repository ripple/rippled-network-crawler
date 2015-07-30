'use strict';
var src = require('./program');

module.exports = function(ipp, dbUrl, commander) {
  console.log("FOREVER: calling ENTER.....")
  commander.store = dbUrl;  // turning on -s dbUrl flag.
  src
  .enter(ipp, commander)
  .then(function(){
    callPrior(dbUrl, commander);
  })
  .catch(function(error){
    console.log("FOREVER: error: ENTER did not finish successfully");
  });  
};

function callPrior(dbUrl, commander){
  console.log("FOREVER: calling PRIOR.....")
  src
  .prior(dbUrl, commander)
  .then(function(){
    callPrior(dbUrl, commander);
  })
  .catch(function(error){
    console.log("FOREVER: error: PRIOR did not finish successfully");
    console.log(error);
  })
}