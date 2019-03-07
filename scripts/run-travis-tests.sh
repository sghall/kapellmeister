#!/bin/bash
set -ev
npm run test
## coveralls < ./coverage/lcov.info
