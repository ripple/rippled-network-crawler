var _ = require('lodash');
var fs = require('fs');
var crawler = require('../src/crawler.js')
var geoip = require('geoip-lite');
var normalizeIpp = crawler.normalizeIpp
var normalizePubKey = crawler.normalizePubKey

var argv = process.argv.slice(2);

if (argv.length == 1) {
  var obj = JSON.parse(fs.readFileSync(argv[0], 'utf8'));
  results = crawlInfo(obj);
  console.log(JSON.stringify(results, null, 4));
} else {
  console.error('eg: node misc/info.js misc/crawls/crawl.json');
  process.exit(1);
}

/*
* Return all unique rippleds
* rippleds are keyed by public key
* and have properties ipp and version
*/
function getRippleds(nodes) {
  var rippleds = {};
  _.each(nodes, function(node) {

    // node properties
    var n_ipp = Object.keys(node)[0];
    var n_peers = node[n_ipp].overlay.active;

    _.each(n_peers, function(peer) {

      // peer properties
      var p_v = peer.version;
      var p_pk = normalizePubKey(peer.public_key);
      try {
        var p_ipp = normalizeIpp(peer.ip, peer.port);
      } catch (error) {
        var p_ipp = undefined;
      }

      // Fill in rippled
      var rippled = rippleds[p_pk]
      if (rippled) {
        if(!rippled.ipp)
          rippled.ipp = p_ipp;
        if(!rippled.version)
          rippled.version = p_v;
      } else {
        rippleds[p_pk] = { ipp: p_ipp, version: p_v };
      }

    });
  });
  return rippleds;
}

function getVersions(rippleds) {
  var versions = {};

  _.each(rippleds, function(rippled) {
    if (versions[rippled.version]) {
      versions[rippled.version] += 1;
    } else {
      versions[rippled.version] = 1;
    }
  });
  return versions;
}

function crawlInfo(rawCrawl) {
  var results = { entry: rawCrawl.entry,
                  rippleds:  {},
                  links:     {},
                  versions:  {},  
                  locations: {},
                  general:   {"nodes": 0}
                }

  var nodes = rawCrawl.data;
  results.rippleds = getRippleds(rawCrawl.data);
  results.versions = getVersions(results.rippleds);
  results.general.nodes = Object.keys(results.rippleds).length;

  return results;
}
