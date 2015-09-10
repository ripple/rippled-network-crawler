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
  .option('-s, --store <dbUrl>',
          'stores crawl output into the database specified (quietly)')
  .option('-q, --quiet',
          'Won\'t output crawl json')
  .option('-l, --logsql',
          'Log all sequelize queries and ddl')
  .option('-m, --message',
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
  .command('prior <dbUrl>')
  .description('Crawl selectively on ipps from latest crawl in the database')
  .action(function(dbUrl) {
    src
    .prior(dbUrl, commander)
    .then(commander.quiet ? _.noop : console.log)
    .catch(console.error)
  });

commander
  .command('info <dbUrl> <id>')
  .description('Get information about a crawl in the database by id')
  .action(function(dbUrl, id) {
    src
    .info(dbUrl, id, commander)
    .then(console.log)
    .catch(console.error);
  });

commander
  .command('graphify <dbUrl> <id>')
  .description('Get a json representing a d3 graph of a crawl by id')
  .action(function(dbUrl, id) {
    src
    .graphify(dbUrl, id, commander)
    .then(console.log)
    .catch(console.error);
  });

commander
  .command('forever <ipp> [dbUrl]')
  .description('run crawl forever starting from ipp (-s flag will be turned on automatically)')
  .action(function(ipp, dbUrl) {
    dbUrl = dbUrl || process.env.HBASE_URL;
    if (!dbUrl) {
      console.log('Error: either specify a dbUrl or set env variable HBASE_URL');
      return;
    }
    if (commander.message) {
      if (!process.env.SQS_URL) {
        console.log('Error: SQS_URL env variable not provided');
        return;
      }
      commander.message = process.env.SQS_URL;
    }
    commander.store = dbUrl;  // turning on -s dbUrl flag.
    src
    .forever(ipp, dbUrl, commander)
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
