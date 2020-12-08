module.exports = require('nconf').argv().env().file({
  file: __dirname + '/../config.json'
}).defaults({
  debug: false,
  verbose: true,
  reset_db: false
});