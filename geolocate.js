require('colors');
const log = require('./src/logger');
require('./src/geolocateNodes')()
  .then(() => {
    process.exit();
  })
  .catch(error => {
    log.error(error);
    process.exit(1);
  });
