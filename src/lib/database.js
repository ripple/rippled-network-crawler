var Sequelize = require('sequelize');
var sql;
var sqlInited;

module.exports = {
   initSql : function(dbUrl, log){
    if(!sqlInited){
      sql = new Sequelize(dbUrl, {logging: log, dialectOptions: {ssl: true}});
      sqlInited = true;
    }
    return sql;
  }
}