'use strict'

var mongoose = require('mongoose')
var config = require('./config')
var bluebird = require('bluebird')

mongoose.Promise = bluebird
mongoose.connect(config.mongo.url)

module.exports = mongoose.connection
