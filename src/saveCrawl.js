const config = require('./config');
const moment = require('moment');
const Hbase = require('ripple-hbase-client');
const hbase = new Hbase(config.get('hbase'));
const log = require('./logger');

const formatKey = 'YYYYMMDDHHmmss';
const timeInfinity = 99999999999999;

const getInverseTimestamp = date => (timeInfinity - Number(moment.utc(date).format(formatKey))).toString();


module.exports = data => {
  log.info(`total connections: ${data.connections.length}`);
  return hbase.putRow({
    table: 'network_crawls',
    rowkey: getInverseTimestamp(data.start),
    columns: data
  })
  .then(() => {
    log.info('network crawl saved');
  });
};