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
  console.error('eg: node misc/info.js misc/crawls/crawl1.json');
  process.exit(1);
}

function crawlInfo(rawCrawl) {
  results = {rippleds:  {},
             links:     {},
             versions:  {},  
             locations: {},
             general:   {"nodes": 0}
            }
  for (var r_key in rawCrawl.data) {
    peers = rawCrawl.data[r_key].overlay.active;
    for (var p_key in peers) {
      peer = peers[p_key]
      // A peer (not necessarily unique)
      try {
        ipp = normalizeIpp(peer.ip, peer.port);
      } catch (err) {
        ipp = undefined;
      }

      public_key = normalizePubKey(peer.public_key);
      version = peer.version
      type = peer.type

      if (ipp != undefined && ipp != "undefined:undefined") {
        geoloc = geoip.lookup(ipp.split(':')[0])
        location = geoloc.country + '_' + geoloc.city
      } else {
        location = undefined
      }

      // unique rippleds
      if(results.rippleds[public_key] == undefined) {
        new_rippled = {}
        results.rippleds[public_key] = { ipp: ipp,
                                         version: version,
                                         raw_key: peer.public_key}

        // versions
        if(results.versions[version] == undefined)
          results.versions[version] = 1;
        else
          results.versions[version] += 1;

        // locations
        if(results.locations[location] == undefined)
          results.locations[location] = 1;
        else
          results.locations[location] += 1;

        // general
        results.general.nodes += 1;
      }

      // links
      // Make link
      var link = undefined
      if (type) {
        // Get link
        if (type == "in") {
          link = [r_key, ipp]
        }
        else if (type == "out") {
          link = [ipp, r_key]
        }
        else if (type == "peer") {
          if (peer.ip) {
            if (peer.ip.split(":").length == 2)
              link = [ipp, r_key]
            else
              link = [r_key, ipp]
          }
        }

        if (link) {
          results.links[link] = 1
        }
      }
    }
  }
  results.general.connections = Object.keys(results.links).length;
  return results
}
