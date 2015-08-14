#!/usr/bin/env node
'use strict';

var commander = require('commander');
var src = require('./src/program');
var moment = require('moment');

commander
  .version(require('./package.json').version)
  .option('-m, --max <count>',
          'Max number of http requests to have open at once, default 100')
  .option('-r, --readable',
          'Output json with four space indentation')
  .option('-s, --store <dbUrl>',
          'Store crawl output into the database specified (quietly)')
  .option('-q, --quiet',
          'Only output crawl json, all logging is ignored')
  .option('-l, --logsql',
          'Log all sequelize queries and ddl')
  .option('-f, --file <dir>',
          'Store crawl output into file in directory specified (only works for forever for now)');

commander
  .command('enter <ipp>')
  .description('Crawl ipp and its peers recursively')
  .action(function(ipp) {
    src
    .enter(ipp, commander)
    .catch(function(err) {
      console.error(err);
    });
  });

commander
  .command('selective <ipp> [otherIpps...]')
  .description('Crawl specified ipps without expanding crawl to peers')
  .action(function(ipp, otherIpps) {
    var ipps = otherIpps ? [ipp].concat(otherIpps) : [ipp];
    src
    .selective(ipps, commander)
    .catch(function(err) {
      console.error(err);
    });
  });

commander
  .command('prior')
  .description('Crawl selectively on ipps from latest crawl in db or file')
  .action(function(dbUrl) {
    src
    .prior(commander)
    .catch(function(err) {
      console.error(err);
    });
  });

commander
  .command('info <dbUrl> <id>')
  .description('Get information about a crawl in the database by id')
  .action(function(dbUrl, id) {
    src
    .info(dbUrl, id, commander)
    .catch(function(err) {
      console.error(err);
    });
  });

commander
  .command('graphify <dbUrl> <id>')
  .description('Get a json representing a d3 graph of a crawl by id')
  .action(function(dbUrl, id) {
    src
    .graphify(dbUrl, id, commander)
    .catch(function(err) {
      console.error(err);
    });
  });

commander
  .command('forever <ipp>')
  .description('run crawl forever starting from ipp')
  .action(function(ipp, dbUrl) {
    console.log('FOREVER called at:' + moment().format());
    src
    .forever(ipp, commander)
    .catch(function(err) {
      console.error(err);
      console.log('FOREVER encountered an error. Shutting down...');
      process.exit(1);
    });
  });

commander
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
