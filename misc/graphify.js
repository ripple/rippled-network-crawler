var fs = require('fs');
var argv = process.argv.slice(2);
var rc_util = require('./rawcrawl_util.js');
var _ = require('lodash');

if (argv.length == 1) {
  var obj = JSON.parse(fs.readFileSync(argv[0], 'utf8'));
  results = graphify(obj);
  console.log(JSON.stringify(results, null, 4));
} else {
  console.error('eg: node misc/graphify.js misc/crawls/crawl.json');
  process.exit(1);
}

/*
* Returns metrics of raw crawl
*/
function graphify(rawCrawl) {
  var results = { nodes: [], 
                  links: [] }

  var pkToIndex = {};
  var rippleds = rc_util.getRippledsC(rawCrawl.data);
  var links = rc_util.getLinks(rawCrawl.data);

  // Fill in nodes and save indices
  _.each(Object.keys(rippleds), function(pk) {
    pkToIndex[pk] = results.nodes.length;
    var node = rippleds[pk];
    node.public_key = pk;
    results.nodes.push(node);
  });

  // Format links to match d3
  _.each(Object.keys(links), function(link) {
    var sIndex = pkToIndex[link.split(',')[0]];
    var tIndex = pkToIndex[link.split(',')[1]];
    if (sIndex && tIndex) {
      var newlink = {};
      newlink.source = pkToIndex[link.split(',')[0]];
      newlink.target = pkToIndex[link.split(',')[1]];
      newlink.value = links[link];
      results.links.push(newlink);
    }
  });

  return results;
}
