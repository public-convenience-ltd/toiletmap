const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.mongo.url);

module.exports = mongoose.connection;
