'use strict';
var rc_util = require('./lib/utility.js');
var _ = require('lodash');
var Promise = require('bluebird');
var HbaseClient = require('crawler-hbase').Client;

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
  return new Promise(function(resolve, reject) {
    var hbaseClient = new HbaseClient(dbUrl);
    hbaseClient.getRawCrawlByKey(id)
    .then(function(row) {
      var graph = graphify(JSON.parse(row.data));
      if (commander.readable) {
        console.log(JSON.stringify(graph, null, 4));
      } else {
        console.log(JSON.stringify(graph));
      }
    }).catch(reject);
  });
};
