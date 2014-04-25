'use strict';

var mongoose = require('mongoose'),
    looReportSchema = require('./loo_schema').looReportSchema;

module.exports = mongoose.model('LooReport', looReportSchema);