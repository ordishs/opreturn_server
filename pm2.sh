#!/bin/bash

cd $(dirname $BASH_SOURCE)

./node_modules/.bin/pm2 $@
