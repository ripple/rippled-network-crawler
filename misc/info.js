var fs = require('fs');
var argv = process.argv.slice(2);
var rc_util = require('./rawcrawl_util.js')

if (argv.length == 1) {
  var obj = JSON.parse(fs.readFileSync(argv[0], 'utf8'));
  results = crawlInfo(obj);
  console.log(JSON.stringify(results, null, 4));
} else {
  console.error('eg: node misc/info.js misc/crawls/crawl.json');
  process.exit(1);
}

/*
* Returns metrics of raw crawl
*/
function crawlInfo(rawCrawl) {
  var results = { entry: rawCrawl.entry,
                  general:   {},
                  rippleds:  {},
                  links:     {},
                  versions:  {},  
                  locations: {}
                }

  var nodes = rawCrawl.data;

  results.rippleds = rc_util.getRippleds(rawCrawl.data);

  results.versions = rc_util.getVersions(rawCrawl.data);

  results.locations = rc_util.getLocations(rawCrawl.data);

  results.links = rc_util.getLinks(rawCrawl.data);

  results.general.nodes = Object.keys(results.rippleds).length;
  results.general.links = Object.keys(results.links).length;
  results.general.versions = Object.keys(results.versions).length;
  results.general.locations = Object.keys(results.locations).length;

  return results;
}
