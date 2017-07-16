#!/bin/bash
set -e
gulp watch &
dtemplate -dir src/ts -lang ts -out src/ts/Templates.ts -watch &
rollup -c --watch &
