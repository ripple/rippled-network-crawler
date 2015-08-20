'use strict';
var Sequelize = require('sequelize');
var sql;
var sqlInited;

var dbUrl
if (process.env.DATABASE_URL) {
  dbUrl = process.env.DATABASE_URL;
} else {
  throw new Error('missing required DATABASE_URL')
}

module.exports = {
  initSql: function(log) {

    if (!sqlInited) {
      sql = new Sequelize(dbUrl,
      {
        logging: log,
        dialectOptions: {
          ssl: true
        },
        pool: {
          maxConnections: 10,
          minConnections: 0,
          maxIdleTime: 10000
        }
      });
      sqlInited = true;
    }
    return sql;
  }
};
