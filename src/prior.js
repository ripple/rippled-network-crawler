'use strict';
var Sequelize = require('sequelize');
var Crawler = require('./lib/crawler.js').Crawler;
var rc_util = require('./lib/utility.js');
var _ = require('lodash');
var modelsFactory = require('./lib/models.js');

function getLatestCrawl(dbUrl, logsql) {
  return new Promise(function(resolve, reject) {
    var log = logsql ? console.log : false;
    var sql = new Sequelize(dbUrl, {logging: log, dialectOptions: {ssl: true}});

    var model = modelsFactory(sql);

    model.Crawl.findOne({
      order: [
        ['id', 'DESC']
      ]
    }).then(function(crawl) {
      return resolve(crawl.data);
    });
  });
}


module.exports = function(dbUrl, commander) {
  getLatestCrawl(dbUrl, commander.logsql).then(function(latestCrawl) {
    var ipps = rc_util.getIpps(latestCrawl);
    console.log(ipps);
  });
};
