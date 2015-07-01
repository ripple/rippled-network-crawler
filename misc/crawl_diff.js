var rc_util = require('../misc/rawcrawl_util.js');
var _ = require('lodash');

var nconf = require('nconf');

nconf.argv().env();
var argv = nconf.get('_')

main(argv[0], argv[1]);

function main(rawCrawl1_file, rawCrawl2_file) {
  var rawCrawl1 = require(rawCrawl1_file);
  var rawCrawl2 = require(rawCrawl2_file);

  var ipps1 = [];
  var ipps2 = [];

  _.each(rawCrawl1.data, function(crawl) {
    ipps1.push(Object.keys(crawl)[0]);
  });
  _.each(rawCrawl2.data, function(crawl) {
    ipps2.push(Object.keys(crawl)[0]);
  });

  console.log(ipps1.length, "crawls in", rawCrawl1_file)
  console.log(ipps2.length, "crawls in", rawCrawl2_file)
  console.log("Diff:", _.difference(ipps1, ipps2));
}
