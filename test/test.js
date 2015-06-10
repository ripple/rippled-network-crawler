Crawler = require('../src/crawler.js').Crawler
var _ = require('lodash');
var util = require('util')

var argv = process.argv.slice(2);

if (argv.length == 1) {
  main(argv[0], false);
} else if (argv.length == 2 && argv[1] == '-e') {
  main(argv[0], true);
} else {
  console.error('eg: node test/test.js s1.ripple.com\n' + 
                '\t-e: prints out the json expanded');
  process.exit(1);
}

function main(entryIp, expanded) {
  var noopLogger = {log: _.noop, error: _.noop};
  var crawler = new Crawler(100, noopLogger)

  crawler.getCrawl(entryIp).then(function(response) {
    if (expanded)
      return console.log(util.inspect(response, {showHidden: false, depth: null}));
    else
      return console.log(response);
  })
  .catch(function(error) {
    console.log('error', error)
  })
}