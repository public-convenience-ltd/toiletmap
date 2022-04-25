#! /bin/sh

set -ae

echo "Building project"
NODE_ENV=test yarn build

echo "Starting in-memory mongo db. Wait until it's populated"
yarn startMemoryMongo & yarn wait-on:memoryMongo

echo "Start the server, wait until it's available"
yarn start & yarn wait-on:server
