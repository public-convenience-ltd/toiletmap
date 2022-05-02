#!/bin/bash
set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

echo "loading environment variables"
source .env

NODE_ENV=test

while getopts 'lhd:' OPTION; do
  case "$OPTION" in
    h)
      echo "Running cypress tests in headless mode"
      yarn build
      yarn start-server-and-test start http://localhost:3000 cypress:headless
      exit 1
      ;;
    d)
      echo "Running cypress tests in development mode"
      yarn start-server-and-test dev http://localhost:3000 cypress
      exit 1
      ;;
    ?)
      echo "script usage: $(basename \$0) [-h] [-d]" >&2
      exit 1
      ;;
  esac
done

echo "Running cypress tests"
yarn build
yarn start-server-and-test start http://localhost:3000 cypress
