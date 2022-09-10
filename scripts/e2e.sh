#!/bin/bash
set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

echo "loading environment variables"

if [[ ! -f ".env.test.local" ]]; then
  echo "No test configuration found. Please create and populate .env.test.local"
  exit 1
fi

source .env.test.local

NODE_ENV=test

while getopts 'lhd:' OPTION; do
  case "$OPTION" in
  h)
    echo "Running cypress tests in headless mode"
    pnpm build
    if [[ -z "${CYPRESS_RECORD_KEY}" ]]; then
      pnpm start-server-and-test start http://localhost:3000 cypress:headless
    else
      pnpm start-server-and-test start http://localhost:3000 cypress:headless:record
    fi
    exit 1
    ;;
  d)
    echo "Running cypress tests in development mode"
    pnpm start-server-and-test dev http://localhost:3000 cypress:open
    exit 1
    ;;
  ?)
    echo "script usage: $(basename \$0) [-h] [-d]" >&2
    exit 1
    ;;
  esac
done

echo "Running cypress tests"
pnpm build
pnpm start-server-and-test start http://localhost:3000 cypress:open
