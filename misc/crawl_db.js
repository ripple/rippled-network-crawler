var Crawler = require('../src/crawler.js').Crawler
var _ = require('lodash');
var fs = require('fs');
var Sequelize = require('sequelize');
var Promise = Sequelize.Promise;
var modelsFactory = require('../src/models.js');

/* --------------------------------- HELPERS -------------------------------- */

function prettyJSON(o) {
  return JSON.stringify(o, undefined, 2);
}

var saveDB = exports.saveDB = function saveDB(crawlJson, entryIp, dbUrl, onDone) {
  var sql = new Sequelize(dbUrl, {logging: console.log, dialectOptions: {ssl: true}});
  var models = modelsFactory(sql, Sequelize);

  sql
  .sync({force: false})
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
  .catch(function(e) {
    onDone(e);
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
  var noopLogger = {log: _.noop, error: _.noop};
  var crawler = new Crawler(100, noopLogger)

  crawler.getCrawl(entryIp).then(function(response) {
    saveDB(response, entryIp, dbUrl, function(error) {
        if (error) {
          throw new Error("Database error:", err);
          process.exit(1);
        } else {
          process.exit(0);
        }
    });
  })
  .catch(function(error) {
    throw new Error("Crawler error:", error);
    process.exit(1);
  })
}