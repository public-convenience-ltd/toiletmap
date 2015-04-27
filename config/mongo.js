'use strict'

var mongoose = require('mongoose')
var config = require('./config')

mongoose.connect(config.mongo.url)

module.exports = mongoose.connection
