Crawler = require('../src/crawler.js').Crawler
var _ = require('lodash');


var argv = process.argv.slice(2);

if (argv.length == 1) {
  main(argv[0]);
} else {
  console.error('eg: node test/test.js '+
                's1.ripple.com');
  process.exit(1);
}

function main(entryIp) {
  var noopLogger = {log: _.noop, error: _.noop};
  var crawler = new Crawler(100, noopLogger)

  crawler.getCrawl(entryIp).then(function(response) {
    return console.log(response);
  })
  .catch(function(error) {
    console.log('error', error)
  })
}