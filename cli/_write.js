#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    pkg = require('../package.json'),
    JSONStream = require('JSONStream'),
    writer,
    items;


function increaseVerbosity(v, total) {
  return total + 1;
}

program
    .version(pkg.version)
    .usage('[options] [writer options]')
    .option('-w, --writer <file>', 'Path to a writer module')
    .option('-v, --verbosity', 'Increase verbosity', increaseVerbosity, 0);

program.on('--help', function(){
    console.log('');
    console.log('    Additional arguments are supplied to the writer module.');
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    Upsert items from stdin to the \'loos\' collection in mongo:');
    console.log('      ./write -v -w ./data/writers/upsert_mongo loos');
    console.log('');
});

program.parse(process.argv);
    
writer = require(path.resolve(program.writer));

if (!writer || (typeof writer !== 'function')) {
    console.error('The supplied writer path must resolve to a module which exposes a callable');
    process.exit(1);
}

// Apply the remaining args to the writer process which will return a log emitter
log = writer.apply(writer, [process.stdin.pipe(JSONStream.parse([true]))].concat(program.args));

if (program.verbosity >= 2) {
    log.on('detail', function(data){
        console.log(data);
    });
}

if (program.verbosity >= 1) {
    log.on('summary', function(data){
        console.log(data);
    });
}

log.on('end', function(){
    process.exit(0);
});







