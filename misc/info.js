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

/*
* Return directed edges between rippleds
* in the form "publickey1, publickey2"
*/
function getLinks(rippleds, nodes) {

  // Create ippToPk using rippleds
  ippToPk = {};
  _.each(Object.keys(rippleds), function(pk) {
    var ipp = rippleds[pk].ipp
    if (ipp)
      ippToPk[ipp] = pk;
  });

  var links = {};
  _.each(nodes, function(node) {

    // node properties
    var n_ipp = Object.keys(node)[0];
    var n_peers = node[n_ipp].overlay.active;

    _.each(n_peers, function(peer) {

      // peer properties
      var p_pk = normalizePubKey(peer.public_key);
      var p_type = peer.type;
      try {
        var p_ipp = normalizeIpp(peer.ip, peer.port);
      } catch (error) {
        var p_ipp = undefined;
      }

      // Make link
      if (p_type) {
        // Get link
        if (p_type == "in") {
          a = ippToPk[n_ipp];
          b = p_pk;
        }
        else if (p_type == "out") {
          a = p_pk;
          b = ippToPk[n_ipp];
        }
        else if (p_type == "peer") {
          if (peer.ip) {
            if (peer.ip.split(":").length == 2) {
              a = ippToPk[n_ipp];
              b = p_pk;
            } else {
              a = p_pk;
              b = ippToPk[n_ipp];
            }
          }
        } else {
          // If type is not in/out/peer
          console.error("shrug");
        }

        links[[a,b]] = 1
      }

    });
  });

  return links;
}

/*
* Return counts of all unique version
* counts are keyed by version
*/
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

/*
* Return counts of all unique locations
* counts are keyed by Country_City
*/
function getLocations(rippleds) {
  var locations = {};

  _.each(rippleds, function(rippled) {
    var ipp = rippled.ipp;
    if (ipp) {
      geoloc = geoip.lookup(ipp.split(':')[0]);
      location = geoloc.country + '_' + geoloc.city;
    } else {
      location = undefined;
    }

    if (locations[location])
      locations[location] += 1;
    else
      locations[location] = 1;
  });
  return locations;
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

  results.rippleds = getRippleds(rawCrawl.data);

  results.versions = getVersions(results.rippleds);

  results.locations = getLocations(results.rippleds);

  results.links = getLinks(results.rippleds, rawCrawl.data);

  results.general.nodes = Object.keys(results.rippleds).length;
  results.general.links = Object.keys(results.links).length;
  results.general.versions = Object.keys(results.versions).length;
  results.general.locations = Object.keys(results.locations).length;

  return results;
}
