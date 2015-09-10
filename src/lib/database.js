'use strict';
var HBase = require('./hbase-thrift');
var hbaseInstances = {};
module.exports = {
  /**
   * returns hbase client.
   * if the same database url is given multiple time the
   * same client will be returned always
   * @param  {string} dbUrl is in host:port format
   * @return {Obj}    the Hbase client
   */
  initHbase: function(dbUrl) {
    if (!hbaseInstances[dbUrl]) {
      hbaseInstances[dbUrl] = new HBase({
        logLevel: 1,
        servers: [{
            host: dbUrl.split(':')[0],
            port: dbUrl.split(':')[1]
          }
        ]
      });
    }
    return hbaseInstances[dbUrl];
  }
};
