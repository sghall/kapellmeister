#!/bin/bash
set -ev
npm run lint
npm run test
## coveralls < ./coverage/lcov.info
