'use strict';
var Promise = require('bluebird');
var moment = require('moment');
var _ = require('lodash');

function normalizeData(rows) {
  return _.map(rows, function(r) {
    var nr = {};
    nr.rowkey = r && r.rowkey && r.rowkey.toString("UTF-8");
    nr.data = r && r.data && r.data.toString("UTF-8");
    nr.entry_ipp = r && r.entry_ipp && r.entry_ipp.toString("UTF-8");
    nr.exceptions = r && r.exceptions && r.exceptions.toString("UTF-8");
    return nr;
  });
}

module.exports.init = function(dbUrl) {
  var hbase = require('./database').initHbase(dbUrl);
  return {
    storeCrawl: function(crawl) {
      return new Promise(function(resolve, reject) {
        var key = moment(crawl.start).valueOf() + '_' + moment(crawl.end).valueOf();
        var cells = {
          'rc:entry_ipp':  crawl.entry,
          'rc:data':       JSON.stringify(crawl.data),
          'rc:exceptions': JSON.stringify(crawl.errors)
        };
        hbase
        .putRow('raw_crawls', key, cells)
        .then(function() {
          resolve(key);
        })
        .catch(reject);
      });
    },

    getRows: function(startKey, endKey, limit, descending) {
      return new Promise(function(resolve, reject) {
        var options = {
            table: 'raw_crawls',
            startRow: startKey,
            stopRow: endKey,
            columns: ['rc:entry_ipp', 'rc:data', 'rc:exceptions']
          };
        if (descending) options.descending = true;
        if (limit) options.limit = limit;
        hbase.getScan(options, function(err, resp) {
            if (err) return reject(err);
            return resolve(normalizeData(resp));
          });
      });
    },
  };
}

module.exports.utils = {
    keyToStart: function(key) {
      return moment(parseInt(key.split('_')[0])).format('YYYY-MM-DDTHH:mm:ss.msZ');
    },

    keyToEnd: function(key) {
      return moment(parseInt(key.split('_')[1])).format('YYYY-MM-DDTHH:mm:ss.msZ');
    }
}