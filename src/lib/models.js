'use strict';
var Sequelize = require('sequelize');

module.exports = function(sql) {
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
  Crawl.sync({force: false});


  return {
    Crawl: Crawl
  };
};
