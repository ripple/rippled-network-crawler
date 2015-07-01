#!/usr/bin/env node

var commander = require('commander');
var _ = require('lodash');
var Crawler = require('./src/lib/crawler.js').Crawler;

commander
  .version(require('./package.json').version)
  .option('-r, --readable', 'Output json with four space indentation')
  .option('-m, --max <count>', 'Max number of http requests to have open at once, default 100')
  //.option('-S, --store <url>', 'stores crawl output into the database specified')
  //.option('-l, --logcraw', 'Log the crawl')

commander
  .command('enter <ipp>')
  .description('Crawl ipp and its peers recursively')
  .action(function(ipp) {
    var noopLogger = {log: _.noop, error: _.noop};
    var maxRequests = commander.max ? parseInt(commander.max) : 100;
    var crawler = new Crawler(maxRequests, noopLogger);
    crawler.getCrawl(ipp)
      .then(function(response) {
        if (commander.readable) {
          console.log(JSON.stringify(response, null, 4));
        } else {
          console.log(JSON.stringify(response));
        }
      })
      .catch(function(error) {
        console.error('error:', error);
      });
  })

commander
  .command('selective <ipp> [otherIpps...]')
  .description('Crawl specified ipps without expanding crawl to peers')
  .action(function(ipp, otherIpps) {
    var ipps = otherIpps ? [ipp].concat(otherIpps) : [ipp];
    var noopLogger = {log: _.noop, error: _.noop};
    var maxRequests = commander.max ? parseInt(commander.max) : 100;
    var crawler = new Crawler(maxRequests, noopLogger);
    crawler.getSelCrawl(ipps)
      .then(function(response) {
        if (commander.readable) {
          console.log(JSON.stringify(response, null, 4));
        } else {
          console.log(JSON.stringify(response));
        }
      })
      .catch(function(error) {
        console.error('error:', error);
      });
  });

commander
  .command('prior <url>')
  //.option('-L, --logsql', 'log all sequelize queries and ddl')
  .description('Crawl selectively on ipps from latest crawl in the database')
  .action(function(url) {
    console.log(url);
  });

commander
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
