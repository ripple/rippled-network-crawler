'use strict';
var Sequelize = require('sequelize');
var rc_util = require('./lib/utility.js');
var modelsFactory = require('./lib/models.js');
var selective = require('./program').selective;

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
      if (!crawl) {
        return reject(new Error('No crawls in database'));
      }
      return resolve(crawl.dataValues);
    }).catch(function(error) {
      return reject(error);
    });
  });
}


module.exports = function(dbUrl, commander) {
  getLatestCrawl(dbUrl, commander.logsql).then(function(latestCrawl) {
    var ipps = rc_util.getIpps(latestCrawl.data);
    if (ipps) {
      selective(ipps, commander);
    }
  }).catch(function(error) {
    console.error(error.message);
    process.exit(1);
  });
};
