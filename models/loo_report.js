'use strict';

var mongoose = require('mongoose'),
    config = require('../config/config'),
    thunk = require('thunkify'),
    Loo = require('./loo'),
    looReportSchema = require('./loo_schema').looReportSchema,
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

looReportSchema.statics.findOrCreate = function*(data){
    // A report is a note about a place, from a person.
    var report = yield LooReport.findOne({geohash: data.geohash, attribution: data.attribution}).exec();
    if (!report) {
        report = new LooReport(data);
        // Necessary 'till save returns a promise in mongoose 3.10
        report.save = thunk(report.save);
        yield report.save();
    } 
    return report;
};

looReportSchema.statics.processReport = function*(data){
    var report = yield LooReport.findOrCreate(data);
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