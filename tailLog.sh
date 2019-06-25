#!/bin/bash

cd $(dirname $BASH_SOURCE)

tail -f ../shared/logs/opreturn_server.log
