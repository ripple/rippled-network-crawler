'use strict';
var DB = require('./lib/database');
var modelsFactory = require('./lib/models.js');
var Promise = require('bluebird');
var fs = require('fs');

function saveFile(crawl, dir, logsql) {
  return new Promise(function(resolve, reject) {
    var filename;
    if (dir.slice(-1) == '/') {
      filename = dir + 'crawl_' + crawl.start;
    } else {
      filename = dir + '/crawl_' + crawl.start;
    }
    fs.writeFile(filename, JSON.stringify(crawl), function (error) {
      if (error) {
        reject(error);
      }  else {
        resolve(filename);
      }
    });
  });
}

module.exports = function(crawl, dir) {
  return new Promise(function(resolve, reject) {
    saveFile(crawl, dir)
    .then(function(filename) {
      console.log('Stored crawl to %s.', filename);
      resolve(crawl.data);
    })
    .catch(function(error) {
      console.error(error);    // this is a crash-worthy error
      process.exit(1);
    });
  });
};
