const config = require('./config');
const DEBUG = config.get('debug');
const VERBOSE = DEBUG || config.get('verbose');

module.exports.debug = function() {
  DEBUG && console.log(...arguments);
};

module.exports.info = function() {
  VERBOSE && console.log(...arguments);
};

module.exports.error = function() {
  console.log(...arguments);
};
