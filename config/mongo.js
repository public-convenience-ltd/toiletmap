'use strict';
var mongoose = require('mongoose'),
    config = require('./config'),
    paginate = require('mongoose-query-paginate'),
    thunkify = require('thunkify'),
    Query = require('mongoose').Query,
    db;

// Thunkify the query paginator
Query.prototype.paginate = thunkify(Query.prototype.paginate);

mongoose.connect(config.mongo.url);

module.exports = mongoose.connection;
