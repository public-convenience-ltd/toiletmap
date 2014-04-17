#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    pkg = require('../package.json'),
    JSONStream = require('JSONStream'),
    tr,
    items,
    output;

program
    .version(pkg.version)
    .usage('[options] [transform options]')
    .option('-t, --transformer <file>', 'Path to a transformer module');

program.on('--help', function(){
    console.log('');
    console.log('    Additional arguments are supplied to the transformer module.');
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    Transform items arriving on stdin with an attribution:');
    console.log('      ./transform -t ./data/transformers/attribution OpenStreetMap');
    console.log('');
});

program.parse(process.argv);

transformer = require(path.resolve(program.transformer));

if (!transformer || (typeof transformer !== 'function')) {
    console.error('The supplied transformer path must resolve to a module which exposes a callable which returns a readable, object-mode stream');
    process.exit(1);
}

// pass stdin and the remaining args to the transformer process which will return a stream
items = transformer.apply(transformer, [process.stdin.pipe(JSONStream.parse([true]))].concat(program.args));

items
    .pipe(JSONStream.stringify())
    .pipe(process.stdout);







