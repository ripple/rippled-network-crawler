var Crawler = require('../src/crawler.js').Crawler
var _ = require('lodash');
var nconf = require('nconf');

nconf.argv().env();
var argv = nconf.get('_')

function hasDuplicates(a) {
  return _.uniq(a).length !== a.length; 
}

var ipps = []

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
  ipps.push(line); 
}).on('close', function() {
  main(ipps);
});

function main(entryIpps) {
  var noopLogger = {log: _.noop, error: _.noop};
  var crawler = new Crawler(5000, noopLogger);
  crawler.getSelCrawl(entryIpps).then(function(response) {
    if (nconf.get('r')) {
      console.log(JSON.stringify(response, null, 4));
    } else {
      console.log(JSON.stringify(response));
    }
  })
  .catch(function(error) {
    console.error('error', error)
  })
}