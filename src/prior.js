'use strict';
var DB = require('./lib/database');
var rc_util = require('./lib/utility.js');
var modelsFactory = require('./lib/models.js');
var selective = require('./program').selective;
var Promise = require('bluebird');

function getLatestCrawl(dbUrl, logsql) {
  return new Promise(function(resolve, reject) {
    var log = logsql ? console.log : false;
    var sql = DB.initSql(dbUrl, log);

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
  return new Promise(function(resolve, reject){
    getLatestCrawl(dbUrl, commander.logsql).then(function(latestCrawl) {
      var ipps = rc_util.getIpps(latestCrawl.data);
      if (ipps) {
        selective(ipps, commander)
        .then(resolve)
        .catch(reject);
      }    
    }).catch(function(error) {
      console.error(error.message);
      reject(error);
    });
  });
};
