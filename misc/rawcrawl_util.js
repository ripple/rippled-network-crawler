var geoip = require('geoip-lite');
var crawler = require('../src/crawler.js')
var normalizeIpp = crawler.normalizeIpp
var normalizePubKey = crawler.normalizePubKey
var _ = require('lodash');

module.exports = {

  /*
  * @param {Object} raw crawl
  * @return {Object} { public_key: {ipp: ipp, version: version} }
  * Takes raw crawl and returns a dictionary of unique rippleds keyed by public
  * key and with the properties ipp and version.
  */
  getRippleds: function(nodes) {
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
  },

  /*
  * @param {Object} raw crawl
  * @return {Object} { publickey1,publickey2: 1 }
  * Takes raw crawl and returns an object of unique edges
  * edges have in the format "publickey1,publickey2" : 1.
  */
  getLinks: function(nodes) {
    rippleds = this.getRippleds(nodes);
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
  },

  /*
  * @param {Object} raw crawl
  * @return {Object} { version: count }
  * Takes a raw crawl and returns a dictionary of versions with their counts.
  */
  getVersions: function(nodes) {
    rippleds = this.getRippleds(nodes);
    var versions = {};

    _.each(rippleds, function(rippled) {
      if (versions[rippled.version]) {
        versions[rippled.version] += 1;
      } else {
        versions[rippled.version] = 1;
      }
    });
    return versions;
  },

  /*
  * @param {Object} raw crawl
  * @return {Object} { location: count }
  * Takes a raw crawl and returns a dictionary of locations with their counts.
  * Locations are in the format COUNTRY_CITY (note that city might be missing).
  */
  getLocations: function(nodes) {
    rippleds = this.getRippleds(nodes);
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
  },

  /*
  * @param {Object} raw crawl
  * @return {Object} {public_key: {in: count, out: count}}
  * Takes a raw crawl and returns the 
  * in and out degree of each rippled instance.
  */
  getDegrees: function(nodes) {
    var links = this.getLinks(nodes);
    var connections = {};

    _.each(Object.keys(links), function(link) {
      var from = link.split(',')[0];
      var to = link.split(',')[0];

      if (connections[from]) {
        connections[from].out += 1;
      } else {
        connections[from] = {in: 0, out: 0};
      }

      if (connections[to]) {
        connections[to].in += 1;
      } else {
        connections[to] = {in: 0, out: 0};
      }

    });

    return connections;
  }

}
