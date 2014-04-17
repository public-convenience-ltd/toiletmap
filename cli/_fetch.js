#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    pkg = require('../package.json'),
    es = require('event-stream'),
    JSONStream = require('JSONStream'),
    fetcher,
    items;

function increaseVerbosity(v, total) {
  return total + 1;
}

program
    .version(pkg.version)
    .usage('[options] [fetcher options]')
    .option('-f, --fetcher <file>', 'Path to a fetcher module');

program.on('--help', function(){
    console.log('');
    console.log('    Additional arguments are supplied to the fetcher module.');
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    Fetch items from OSM\'s overseer using the supplied xml query:');
    console.log('      ./fetch -f ./data/fetchers/overpass ./data/fetchers/overpass/query.xml http://overpass-api.de/api/interpreter');
    console.log('');
});

program.parse(process.argv);
    
fetcher = require(path.resolve(program.fetcher));

if (!fetcher || (typeof fetcher !== 'function')) {
    console.error('The supplied fetcher path must resolve to a module which exposes a callable which returns a readable, object-mode stream');
    process.exit(1);
}

// Apply the remaining args to the fetcher process which will return a stream
items = fetcher.apply(fetcher, program.args);

items
    .pipe(JSONStream.stringify())
    .pipe(process.stdout);







