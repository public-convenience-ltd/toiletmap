'use strict';
var mongoose = require('mongoose'),
    config = require('./config'),
    db;

mongoose.connect(config.mongo.url);

module.exports = mongoose.connection;
