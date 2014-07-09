'use strict';

var mongoose = require('mongoose'),
    config = require('../config/config'),
    thunk = require('thunkify'),
    _ = require('lodash'),
    Loo = require('./loo'),
    looReportSchema = require('./loo_schema').looReportSchema,
    geohash = require('geo-hash'),
    LooReport;

/**
 * Find the loo to which this report is attatched, or a nearby loo
 */
looReportSchema.statics.findLooFor = function*(report){
    // Do we have a loo which references this report?
    var loo = yield Loo.findOne({reports: { $in: [report._id] }}).exec();

    if (!loo) {
        // Nope. How about one which is within x meters (and so is probably the same real loo)
        loo = yield Loo.findOne({geometry: {
            $near: {
                $geometry : report.geometry.toJSON(),
                $maxDistance : config.deduplication.radius
            }
        }}).exec();
    }
    return loo;
};

looReportSchema.statics.processReport = function*(data){
    var ghash = geohash.encode(data.geometry.coordinates[1], data.geometry.coordinates[0]);
    //Strip tags from plain text entries
    _.each(['notes', 'cost'], function(v, i){
        if (data.properties[v]) {
            data.properties[v] = data.properties[v].replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '').trim();
        }
    });
    var report = yield LooReport.findOneAndUpdate(
            {geohash: ghash, attribution: data.attribution},
            data,
            {upsert: true}
        ).exec();

    var loo = yield LooReport.findLooFor(report);
    if (!loo) {
        // Derive a new loo from this report
        loo = Loo.fromLooReport(report);
    }

    // Ensure that this report is referenced by the loo
    if (loo.reports.indexOf(report._id) === -1) {
        loo.reports.push(report._id);
    }

    // Get the loo to regenerate its data
    yield loo.regenerate();

    // Save the result
    loo.save = thunk(loo.save);
    yield loo.save();

    return [report, loo];  
};

module.exports = LooReport = mongoose.model('LooReport', looReportSchema);