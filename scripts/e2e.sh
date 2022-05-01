#!/bin/bash


set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

echo "loading environment variables"
source .env

NODE_ENV=test

yarn build
yarn start-server-and-test start http://localhost:3000 cypress
