'use strict'

var mongoose = require('mongoose')
var config = require('./config')
var thunkify = require('thunkify')
var Query = require('mongoose').Query
require('mongoose-query-paginate')

// Thunkify the query paginator
Query.prototype.paginate = thunkify(Query.prototype.paginate)

mongoose.connect(config.mongo.url)

module.exports = mongoose.connection
