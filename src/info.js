'use strict';
var Sequelize = require('sequelize');
var rc_util = require('./lib/utility.js');
var modelsFactory = require('./lib/models.js');
var _ = require('lodash');

function getCrawlById(dbUrl, id, logsql) {
  return new Promise(function(resolve, reject) {
    var log = logsql ? console.log : false;
    var sql = new Sequelize(dbUrl, {logging: log, dialectOptions: {ssl: true}});

    var model = modelsFactory(sql);

    model.Crawl.findById(id).then(function(crawl) {
      if (!crawl) {
        return reject(new Error('No crawls with id ' + id));
      }
      return resolve(crawl.dataValues);
    }).catch(function(error) {
      return reject(error);
    });
  });
}

function getAvgIn(degrees) {
  var sum = 0;
  _.each(degrees, function(rippled) {
    sum += parseInt(rippled.in, 10);
  });

  return sum / Object.keys(degrees).length;
}

function getAvgOut(degrees) {
  var sum = 0;
  _.each(degrees, function(rippled) {
    sum += parseInt(rippled.out, 10);
  });
  return sum / Object.keys(degrees).length;
}

module.exports = function(dbUrl, id, commander) {
  id = parseInt(id, 10);
  getCrawlById(dbUrl, id, commander.logsql).then(function(crawl) {
    var results = {entry: crawl.entry_ipp,
                   general: {},
                   rippleds: {},
                   links: {},
                   degrees: {},
                   versions: {},
                   locations: {}};

    results.rippleds = rc_util.getRippledsC(crawl.data);

    results.versions = rc_util.getVersions(crawl.data);

    results.locations = rc_util.getLocations(crawl.data);

    results.links = rc_util.getLinks(crawl.data);

    results.degrees = rc_util.getDegrees(crawl.data);

    results.general.nodes = Object.keys(results.rippleds).length;
    results.general.links = Object.keys(results.links).length;
    results.general.versions = Object.keys(results.versions).length;
    results.general.locations = Object.keys(results.locations).length;
    results.general.avgIn = getAvgIn(results.degrees);
    results.general.avgOut = getAvgOut(results.degrees);

    console.log(results);
    process.exit(0);
  }).catch(function(error) {
    console.error(error.message);
    process.exit(1);
  });
};
