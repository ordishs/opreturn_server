#!/bin/bash

cd $(dirname $BASH_SOURCE)

mkdir -p ../shared/logs

./node_modules/.bin/pm2 start opreturn_server.config.js $@

echo "Use './tailLog.sh' to see current activity."
