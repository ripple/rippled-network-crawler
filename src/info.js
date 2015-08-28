'use strict';
var rc_util = require('./lib/utility.js');
var _ = require('lodash');
var Promise = require('bluebird');

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
  return new Promise(function(resolve, reject) {
    id = parseInt(id, 10);
    rc_util.getRowById(dbUrl, id, commander.logsql).then(function(row) {
      var body = JSON.parse(row.data);
      var results = {entry: row.entry_ipp,
                     general: {},
                     rippleds: {},
                     links: {},
                     degrees: {},
                     versions: {}};

      results.rippleds = rc_util.getRippledsC(body);

      results.versions = rc_util.getVersions(body);

      results.links = rc_util.getLinks(body);

      results.degrees = rc_util.getDegrees(body);

      results.general.nodes = Object.keys(results.rippleds).length;
      results.general.links = Object.keys(results.links).length;
      results.general.versions = Object.keys(results.versions).length;
      results.general.avgIn = getAvgIn(results.degrees);
      results.general.avgOut = getAvgOut(results.degrees);

      console.log(results);
    }).catch(reject);
  });
};
