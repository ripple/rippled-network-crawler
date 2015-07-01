var _ = require('lodash');
var Sequelize = require('sequelize');
var Promise = Sequelize.Promise; // bluebird++

var create = module.exports = function(sql) {
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
      type: Sequelize.JSON
    },
    exceptions: {
      type: Sequelize.JSON
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return {
    Crawl: Crawl
  };
};
