var fs = require('fs');
var argv = process.argv.slice(2);
var rc_util = require('./rawcrawl_util.js');
var _ = require('lodash');

if (argv.length == 1) {
  var obj = JSON.parse(fs.readFileSync(argv[0], 'utf8'));
  results = crawlInfo(obj);
  console.log(JSON.stringify(results, null, 4));
} else {
  console.error('eg: node misc/info.js misc/crawls/crawl.json');
  process.exit(1);
}

function getAvgIn(degrees) {
  var sum = 0;
  _.each(degrees, function(rippled) {
    sum += parseInt(rippled.in);
  });

  return sum/Object.keys(degrees).length;
}

function getAvgOut(degrees) {
  var sum = 0;
  _.each(degrees, function(rippled) {
    sum += parseInt(rippled.out);
  });
  return sum/Object.keys(degrees).length;
}

/*
* Returns metrics of raw crawl
*/
function crawlInfo(rawCrawl) {
  var results = { entry: rawCrawl.entry,
                  general:   {},
                  rippleds:  {},
                  links:     {},
                  degrees:   {},
                  versions:  {},
                  locations: {}
                }

  var nodes = rawCrawl.data;

  results.rippleds = rc_util.getRippledsC(rawCrawl.data);

  results.versions = rc_util.getVersions(rawCrawl.data);

  results.locations = rc_util.getLocations(rawCrawl.data);

  results.links = rc_util.getLinks(rawCrawl.data);

  results.degrees = rc_util.getDegrees(rawCrawl.data);

  results.general.nodes = Object.keys(results.rippleds).length;
  results.general.links = Object.keys(results.links).length;
  results.general.versions = Object.keys(results.versions).length;
  results.general.locations = Object.keys(results.locations).length;
  results.general.avgIn = getAvgIn(results.degrees);
  results.general.avgOut = getAvgOut(results.degrees);

  return results;
}
