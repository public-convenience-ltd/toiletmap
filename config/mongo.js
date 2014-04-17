'use strict';

var monk = require('monk'),
    wrap = require('co-monk'),
    config = require('./config'),
    co = require('co'),
    db = monk(config.mongo.url),
    loos = wrap(db.get('loos'));

// Build indexes
co(function*(){
    yield loos.index({'geometry': '2dsphere'});
})();


module.exports.loos = loos;