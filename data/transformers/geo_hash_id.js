var through = require('through'),
    _ = require('lodash'),
    geo = require('geo-hash');

function transform(omit) {
    return through(function write(data){
        data.id = geo.encode(data.geometry.coordinates[1], data.geometry.coordinates[0]);
        this.queue(data);
    });
    
}

module.exports = function(items) {
    var out = through();
    items
        .pipe(transform())
        .pipe(out);
    return out;
};