'use strict';
var Promise = require('bluebird');
var moment = require('moment');
var hbaseUtils = require('crawler-hbase').utils;
var HbaseClient = require('crawler-hbase').Client;

function saveDB(crawlJson, dbUrl) {
  var hbaseClient = new HbaseClient(dbUrl);
  return hbaseClient.storeRawCrawl(crawlJson);
}

module.exports = function(crawl, dbUrl, logsql) {
  return new Promise(function(resolve, reject) {
    saveDB(crawl, dbUrl)
    .then(function(key) {
      console.log('Stored crawl %s (%s) \t at %s \t to hBase at %s', key, hbaseUtils.keyToStart(key), moment().format(), dbUrl);
      resolve(key);
    })
    .catch(function(err) {
      console.error(err);    // this is a serious error
      process.exit(1);
    });
  });
};
