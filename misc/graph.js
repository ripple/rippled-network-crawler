var rc_util = require('../src/lib/utility.js');
var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');

function ippCount(crawl) {
  return rc_util.getIpps(crawl).length;
}

function pubKeyCount(crawl) {
  return Object.keys(rc_util.getRippleds(crawl)).length;
}

function edgeCount(crawl) {
  return Object.keys(rc_util.getLinks(crawl)).length;
}

function graph(rows) {
  console.log('date\tpubKey\tipp\tedge')
  _.each(rows, function(row) {
    console.error(row.start_at)
    start = new Date(row.start_at).toISOString();
    crawl = row.data;
    console.log(start + '\t' + pubKeyCount(crawl) +
                        '\t' + ippCount(crawl) +
                        '\t' + edgeCount(crawl));
  })
}

var db = "postgres://u787aj8fg8bcfd:p33qf635d4afno85li3sgoepl1n@ec2-54-83-49-216.compute-1.amazonaws.com:5532/dehjrtgfunc127"
var start = "2015-08-01T00:00:00"
var end = "2015-08-01T01:00:00" 
var interval = "1"

rc_util.getCrawlsFiltered(db, start, end, interval)
.then(graph);
