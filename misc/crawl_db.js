var Crawler = require('../src/crawler.js').Crawler
var _ = require('lodash');
var nconf = require('nconf');
var Sequelize = require('sequelize');
var Promise = Sequelize.Promise;
var modelsFactory = require('../src/models.js');

/* --------------------------------- CONSTS --------------------------------- */

nconf.argv().env();

/* --------------------------------- HELPERS -------------------------------- */

var saveDB = exports.saveDB = function saveDB(crawlJson, dbUrl, onDone) {
  var sql = new Sequelize(dbUrl, {logging: nconf.get('LOG_SQL') ? console.log : false, dialectOptions: {ssl: true}});
  var models = modelsFactory(sql, Sequelize);

  sql
  .sync({force: nconf.get('DROP_TABLES')})
  .then(function() {
    return models.Crawl.create({  start_at: crawlJson.start,
                                  end_at: crawlJson.end,
                                  entry_ipp: crawlJson.entry,
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

var argv = nconf.get('_')

if (argv.length == 2) {
  main(argv[0], argv[1]);
} else {
  console.error('eg: node misc/crawl.js 192.170.145.70:51235 postgres://postgres:zxccxz@localhost:5432/crawl');
  process.exit(1);
}

function main(entryIp, dbUrl) {
  if (nconf.get('DROP_TABLES')) {
    console.warn('DROP_TABLES', nconf.get('DROP_TABLES'));
  }

  var noopLogger = {log: _.noop, error: _.noop};
  var crawler = new Crawler(100, nconf.get('LOG_CRAWL') ? console : noopLogger)

  crawler.getCrawl(entryIp).then(function(crawlJson) {
    //console.log(JSON.stringify(crawlJson, null, 4));
    saveDB(crawlJson, dbUrl, function(error) {
      if (error) {
        console.error("Database error:", error);
        process.exit(1);
      } else {
        console.log("Saved to db");
        process.exit(0);
      }
    });
  })
  .catch(function(error) {
    console.error("Crawler error:", error);
    process.exit(1);
  })
}
