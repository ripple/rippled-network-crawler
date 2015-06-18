var Crawler = require('../src/crawler.js').Crawler
var _ = require('lodash');
var fs = require('fs');
var Sequelize = require('sequelize');
var Promise = Sequelize.Promise;
var modelsFactory = require('../src/models.js');

/* --------------------------------- CONSTS --------------------------------- */

var config = {};

['DROP_TABLES', 'LOG_SQL', 'LOG_CRAWL'].forEach(function(k) {
  config[k] = process.env[k] !== undefined;
});

/* --------------------------------- HELPERS -------------------------------- */

var saveDB = exports.saveDB = function saveDB(crawlJson, entryIp, dbUrl, onDone) {
  var sql = new Sequelize(dbUrl, {logging: config.LOG_SQL ? console.log : false, dialectOptions: {ssl: true}});
  var models = modelsFactory(sql, Sequelize);

  sql
  .sync({force: config.DROP_TABLES})
  .then(function() {
    return models.Crawl.create({  start_at: crawlJson.start,
                                  end_at: crawlJson.end,
                                  entry_ipp: entryIp,
                                  data: crawlJson.data,
                                  exceptions: crawlJson.errors
                                });
  }).then(function() {
    onDone(null);
  })
  .catch(function(error) {
    onDone(error);
  });
}

/* ---------------------------------- MAIN ---------------------------------- */

var argv = process.argv.slice(2);

if (argv.length == 2) {
  main(argv[0], argv[1]);
} else {
  console.error('eg: node misc/crawl.js 192.170.145.70:51235 postgres://postgres:zxccxz@localhost:5432/crawl');
  process.exit(1);
}

function main(entryIp, dbUrl) {
  if (config.DROP_TABLES) {
    console.warn('DROP_TABLES', config.DROP_TABLES);
  }

  var noopLogger = {log: _.noop, error: _.noop};
  var crawler = new Crawler(100, config.LOG_CRAWL ? undefined : noopLogger)

  crawler.getCrawl(entryIp).then(function(crawlJson) {
    saveDB(crawlJson, entryIp, dbUrl, function(error) {
        if (error) {
          console.error("Database error:", error);
          process.exit(1);
        } else {
          process.exit(0);
        }
    });
  })
  .catch(function(error) {
    console.error("Crawler error:", error);
    process.exit(1);
  })
}