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
  .option('-s, --store <dbUrl>',
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
  .command('prior <dbUrl>')
  .description('Crawl selectively on ipps from latest crawl in the database')
  .action(function(dbUrl) {
    src.prior(dbUrl, commander);
  });

commander
  .command('info <dbUrl> <id>')
  .description('Get information about a crawl in the database by id')
  .action(function(dbUrl, id) {
    src.info(dbUrl, id, commander);
  });

commander
  .command('graphify <dbUrl> <id>')
  .description('Get a json representing a d3 graph of a crawl by id')
  .action(function(dbUrl, id) {
    src.graphify(dbUrl, id, commander);
  });

commander
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
