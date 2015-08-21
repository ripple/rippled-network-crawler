'use strict';
var Promise = require('bluebird');
var Sequelize = require('sequelize');

module.exports = function(sql) {
  return new Promise(function(resolve, reject) {
    var Crawl = sql.define('crawl', {
      id: {
        type: Sequelize.BIGINT,
              autoIncrement: true,
              primaryKey: true
      },
      start_at: {
        type: Sequelize.DATE
      },
      end_at: {
        type: Sequelize.DATE
      },
      entry_ipp: {
        type: Sequelize.TEXT
      },
      data: {
        type: Sequelize.TEXT
      },
      exceptions: {
        type: Sequelize.TEXT
      }
    }, {
      timestamps: true,
      underscored: true
    });
    return Crawl.sync({force: false}).then(function(){
      resolve({
        Crawl: Crawl
      });
    });
  });
};
