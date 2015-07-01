#!/usr/bin/env node
'use strict';

var commander = require('commander');
var src = require('./src/program');

commander
  .version(require('./package.json').version)
  .option('-m, --max <count>',
          'Max number of http requests to have open at once, default 100')
  .option('-r, --readable',
          'Output json with four space indentation')
  .option('-s, --store <url>',
          'stores crawl output into the database specified (quietly)')
  .option('-q, --quiet',
          'Only output crawl json, all logging is ignored')
  .option('-l, --logsql',
          'Log all sequelize queries and ddl');

commander
  .command('enter <ipp>')
  .description('Crawl ipp and its peers recursively')
  .action(function(ipp) {
    src.enter(ipp, commander);
  });

commander
  .command('selective <ipp> [otherIpps...]')
  .description('Crawl specified ipps without expanding crawl to peers')
  .action(function(ipp, otherIpps) {
    var ipps = otherIpps ? [ipp].concat(otherIpps) : [ipp];
    src.selective(ipps, commander);
  });

commander
  .command('prior <url>')
  .description('Crawl selectively on ipps from latest crawl in the database')
  .action(function(url) {
    src.prior(url, commander);
  });

commander
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
