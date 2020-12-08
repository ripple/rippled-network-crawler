#!/bin/sh
set -e

cd /crawler

cp config/config.json config.json

set +e
/usr/local/bin/node setup
set -e

/usr/local/bin/node index
