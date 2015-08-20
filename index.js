#!/usr/bin/env node
'use strict';

var commander = require('commander');
var src = require('./src/program');
var moment = require('moment');
var _ = require('lodash');

commander
  .version(require('./package.json').version)
  .option('-c, --count <count>',
          'Max number of http requests to have open at once, default 100')
  .option('-s, --store',
          'stores crawl output into the database specified in DATABASE_URL (quietly)')
  .option('-q, --quiet',
          'Won\'t output crawl json')
  .option('-l, --logsql',
          'Log all sequelize queries and ddl')
  .option('-m, --message <queueUrl>',
          'Send message for each crawl stored to db (needs -s) to sqs queue');

commander
  .command('enter <ipp>')
  .description('Crawl ipp and its peers recursively')
  .action(function(ipp) {
    src
    .enter(ipp, commander)
    .then(commander.quiet ? _.noop : console.log)
    .catch(console.error);
  });

commander
  .command('selective <ipp> [otherIpps...]')
  .description('Crawl specified ipps without expanding crawl to peers')
  .action(function(ipp, otherIpps) {
    var ipps = otherIpps ? [ipp].concat(otherIpps) : [ipp];
    src
    .selective(ipps, commander)
    .then(commander.quiet ? _.noop : console.log)
    .catch(console.error);
  });

commander
  .command('prior')
  .description('Crawl selectively on ipps from latest crawl in the database')
  .action(function() {
    src
    .prior(commander)
    .then(commander.quiet ? _.noop : console.log)
    .catch(console.error)
  });

commander
  .command('info <id>')
  .description('Get information about a crawl in the database by id')
  .action(function(id) {
    src
    .info(id, commander)
    .then(console.log)
    .catch(console.error);
  });

commander
  .command('graphify <id>')
  .description('Get a json representing a d3 graph of a crawl by id')
  .action(function(id) {
    src
    .graphify(id, commander)
    .then(console.log)
    .catch(console.error);
  });

commander
  .command('forever <ipp>')
  .description('run crawl forever starting from ipp (-s flag will be turned on automatically)')
  .action(function(ipp) {
    src
    .forever(ipp, commander)
    .then(commander.quiet ? _.noop : console.log)
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
