var through = require('through'),
    _ = require('lodash');

function transform(omit) {
    return through(function write(data){
        this.queue(
            _.omit.apply(_, [data].concat(omit))
        );
    });
    
}

module.exports = function(items) {
    var out = through(),
        omissions = Array.prototype.slice.call(arguments, 1);
    items
        .pipe(transform(omissions))
        .pipe(out);
    return out;
};

