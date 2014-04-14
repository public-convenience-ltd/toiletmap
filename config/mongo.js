'use strict';

var monk = require('monk'),
    wrap = require('co-monk'),
    config = require('./config'),
    db = monk(config.mongo.url),
    loos = wrap(db.get('loos'));

module.exports.loos = loos;