var through = require('through'),
    _ = require('lodash'),
    JSONStream = require('JSONStream');

function transform(attribution) {
    return through(function write(data){
        this.queue(_.extend(data, {'attribution': attribution}));
    });
    
}

module.exports = function(items, attribution) {
    var out = through();
    items
        .pipe(transform(attribution))
        .pipe(out);
    return out;
};

