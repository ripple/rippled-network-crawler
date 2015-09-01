'use strict';
var crawler = require('./crawler.js');
var normalizeIpp = crawler.normalizeIpp;
var normalizePubKey = crawler.normalizePubKey;
var _ = require('lodash');
var DB = require('./database');
var modelsFactory = require('./models.js');
var Promise = require('bluebird');

var toNormPubKey = {};

module.exports = {

  /*
  * @param {Object} raw crawl
  * @return {Object} { public_key: {ipp: ipp, version: version} }
  * Takes raw crawl and returns a dictionary of unique rippleds keyed by public
  * key and with the properties ipp and version.
  */
  getRippleds: function(nodes) {
    var rippleds = {};
    var maxUptimeByIpp = {};

    _.each(nodes, function(node) {

      // node properties
      var n_ipp = Object.keys(node)[0];
      maxUptimeByIpp[n_ipp] = 0;
      var n_peers = node[n_ipp].overlay.active;

      _.each(n_peers, function(peer) {

        // peer properties
        var p_v = peer.version;
        var p_pk;
        if (toNormPubKey[peer.public_key]) {
          p_pk = toNormPubKey[peer.public_key];
        } else {
          p_pk = normalizePubKey(peer.public_key);
          toNormPubKey[peer.public_key] = p_pk;
        }
        var p_ipp;
        try {
          p_ipp = normalizeIpp(peer.ip, peer.port);
        } catch (error) {
          p_ipp = undefined;
        }
        var uptime = peer.uptime;
        maxUptimeByIpp[n_ipp] = Math.max(maxUptimeByIpp[n_ipp], uptime);
        // Fill in rippled
        var rippled = rippleds[p_pk];
        if (rippled) {
          if (!rippled.ipp) {
            rippled.ipp = p_ipp;
          }
          if (!rippled.version) {
            rippled.version = p_v;
          }
          if (!rippled.uptime || rippled.uptime<uptime) {
            rippled.uptime = uptime;
          }
        } else {
          rippleds[p_pk] = {ipp: p_ipp, version: p_v, uptime: uptime};
        }
      });
    });
    // correcting uptime once rippleds and maxUptimeByIpp are ready
    _.each(rippleds, function(r) {
      var peerMaxUptime = r.ipp && maxUptimeByIpp[r.ipp];
      if (!r.uptime || peerMaxUptime > r.uptime) {
        r.uptime = peerMaxUptime;
      }
    });
    return rippleds;
  },

  /*
  * @param {Object} raw crawl
  * @return {Object} {public_key: {ipp: ipp,
  *                                version: version,
  *                                in: count, out: count}}
  * Takes raw crawl and returns a dictionary of unique rippleds keyed by public
  * key and with the properties ipp, version, in count and out count.
  */
  getRippledsC: function(nodes) {
    var rippleds = this.getRippleds(nodes);
    var degrees = this.getDegrees(nodes);
    _.each(Object.keys(degrees), function(pk) {
      if (rippleds[pk]) {
        rippleds[pk].in = degrees[pk].in;
        rippleds[pk].out = degrees[pk].out;
      }
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
    var rippleds = this.getRippleds(nodes);
    // Create ippToPk using rippleds
    var ippToPk = {};
    _.each(Object.keys(rippleds), function(pk) {
      var ipp = rippleds[pk].ipp;
      if (ipp) {
        ippToPk[ipp] = pk;
      }
    });

    var links = {};
    _.each(nodes, function(node) {

      // node properties
      var n_ipp = Object.keys(node)[0];
      var n_peers = node[n_ipp].overlay.active;

      _.each(n_peers, function(peer) {

        // peer properties
        var p_pk;
        if (toNormPubKey[peer.public_key]) {
          p_pk = toNormPubKey[peer.public_key];
        } else {
          p_pk = normalizePubKey(peer.public_key);
          toNormPubKey[peer.public_key] = p_pk;
        }
        var p_type = peer.type;

        var a, b;
        // Make link
        if (p_type) {
          // Get link
          if (p_type === 'in') {
            a = ippToPk[n_ipp];
            b = p_pk;
          } else if (p_type === 'out') {
            a = p_pk;
            b = ippToPk[n_ipp];
          } else if (p_type === 'peer') {
            if (peer.ip) {
              if (peer.ip.split(':').length === 2) {
                a = ippToPk[n_ipp];
                b = p_pk;
              } else {
                a = p_pk;
                b = ippToPk[n_ipp];
              }
            }
          } else {
            // If type is not in/out/peer
            throw new Error('Peer has unexpected type');
          }

          if (a !== undefined && b !== undefined) {
            if (links[[a, b]] === undefined) {
              links[[a, b]] = 0;
            }
            links[[a, b]] += 1;
          }
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
    var rippleds = this.getRippleds(nodes);
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
  /*
  getLocations: function(nodes) {
    var rippleds = this.getRippleds(nodes);
    var locations = {};

    _.each(rippleds, function(rippled) {
      var ipp = rippled.ipp;
      var location;
      if (ipp) {
        var geoloc = geoip.lookup(ipp.split(':')[0]);
        location = geoloc.country + '_' + geoloc.city;
      }

      if (locations[location]) {
        locations[location] += 1;
      } else {
        locations[location] = 1;
      }
    });
    return locations;
  },
  */

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
      var to = link.split(',')[1];

      if (!connections[from]) {
        connections[from] = {in: 0, out: 0};
      }
      connections[from].out += 1;

      if (!connections[to]) {
        connections[to] = {in: 0, out: 0};
      }
      connections[to].in += 1;

    });

    return connections;
  },

  /*
  * @param {Object} raw crawl
  * @return {Array} ipp
  * Takes a raw crawl and returns an
  * array of the ipps which were crawled
  */
  getCrawledIpps: function(nodes) {
    var ipps = [];
    _.each(nodes, function(crawl) {
      ipps.push(Object.keys(crawl)[0]);
    });

    return ipps;
  },

  /*
  * @param {Object} raw crawl
  * @return {Array} ipp
  * Takes a raw crawl and returns an
  * array of the all the unique ipps present
  */
  getIpps: function(nodes) {
    var ipps = {};

    _.each(nodes, function(node) {

      // node properties
      var n_ipp = Object.keys(node)[0];
      var n_peers = node[n_ipp].overlay.active;

      ipps[n_ipp] = 1;

      _.each(n_peers, function(peer) {

        // peer properties
        var p_ipp;
        try {
          p_ipp = normalizeIpp(peer.ip, peer.port);
          ipps[p_ipp] = 1;
        } catch (error) {
          p_ipp = undefined;
        }

      });
    });

    var out = [];
    _.each(Object.keys(ipps), function(ipp) {
      out.push(ipp);
    });

    return out;
  },

  /*
  * @param {String} database url
  * @param {String} id of crawl
  * @param {Boolean} logsql
  * @return {Object} row of crawl from db
  * Takes a database and id to return
  * the row with that id (which contains a crawl)
  * Note: See readme for stucture of row in db
  */
  getRowById: function(dbUrl, id, logsql) {
    return new Promise(function(resolve, reject) {
      if (id <= 0) {
        return reject('Invalid id range');
      }
      var log = logsql ? console.log : false;
      var sql = DB.initSql(dbUrl, log);

      return modelsFactory(sql).then(function(model) {
        return model.Crawl.findById(id).then(function(crawl) {
          if (crawl) {
            return resolve(crawl.dataValues);
          } else {
            return resolve();
          }
        }).catch(function(error) {
          return reject(error);
        });
      });
    });
  },

  /*
  * @param {String} database url
  * @param {String} start id
  * @param {String} end id
  * @param {Boolean} logsql
  * Takes a database and a range of ids to return
  * the an array of rows (which contains crawls)
  * Note: See readme for stucture of row in db
  */
  getRowsByIds: function(dbUrl, startId, endId, logsql) {
    return new Promise(function(resolve, reject) {
      if (endId < startId || startId < 0 || endId < 0) {
        return reject('Invalid id range');
      }

      var log = logsql ? console.log : false;
      var sql = DB.initSql(dbUrl, log);

      return modelsFactory(sql).then(function(model) {
        return model.Crawl.findAll({
          where: ["id >= ? and id <= ?", startId, endId]
        }).then(function(crawls) {
          return resolve(_.map(crawls, function(c){ return c.dataValues; }));
        }).catch(function(error) {
          return reject(error);
        });
      });
    });
  },

  /*
  * @param {String} database url
  * @param {Boolean} logsql
  * Takes a database and returns
  * the last row (which contains a crawl)
  * Note: See readme for stucture of row in db
  */
  getLatestRow: function(dbUrl, logsql) {
    return new Promise(function(resolve, reject) {
      var log = logsql ? console.log : false;
      var sql = DB.initSql(dbUrl, log);

      return modelsFactory(sql).then(function(model) {
        return model.Crawl.findOne({
          order: [
            ['id', 'DESC']
          ]
        }).then(function(crawl) {
          if (crawl) {
            return resolve(crawl.dataValues);
          } else {
            return resolve();
          }
        }).catch(function(error) {
          return reject(error);
        });
      });
    });
  }
};
