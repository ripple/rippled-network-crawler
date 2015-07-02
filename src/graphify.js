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

/*
* Returns metrics of raw crawl
*/
function graphify(crawl) {
  var results = {nodes: [], links: []};
  var pkToIndex = {};
  var rippleds = rc_util.getRippledsC(crawl);
  var links = rc_util.getLinks(crawl);

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
    if (sIndex !== undefined && tIndex !== undefined) {
      var newlink = {};
      newlink.source = pkToIndex[link.split(',')[0]];
      newlink.target = pkToIndex[link.split(',')[1]];
      newlink.value = links[link];
      results.links.push(newlink);
    }
  });

  return results;
}

module.exports = function(dbUrl, id, commander) {
  getCrawlById(dbUrl, id, commander.logsql).then(function(crawl) {
    var graph = graphify(crawl.data);
    if (commander.readable) {
      console.log(JSON.stringify(graph, null, 4));
    } else {
      console.log(JSON.stringify(graph));
    }
  }).catch(function(error) {
    console.error(error.message);
  });
};
