'use strict'

var mongoose = require('mongoose')
var config = require('../config/config')
var _ = require('lodash')
var Loo = require('./loo')
var looReportSchema = require('./loo_schema').looReportSchema
var geohash = require('geo-hash')
var LooReport

/**
 * Find the loo to which this report is attatched, or a nearby loo
 */
looReportSchema.statics.findLooFor = function * (report) {
  // Do we have a loo which references this report?
  var loo = yield Loo.findOne({reports: { $in: [report._id] }}).exec()

  if (!loo) {
    // Nope. How about one which is within x meters (and so is probably the same real loo)
    loo = yield Loo.findOne({geometry: {
      $near: {
        $geometry: report.geometry.toJSON(),
        $maxDistance: config.deduplication.radius
      }
    }}).exec()
  }
  return loo
}

looReportSchema.statics.processReport = function * (data) {
  var report
  var ghash = geohash.encode(data.geometry.coordinates[1], data.geometry.coordinates[0])
  // Strip tags from plain text entries
  _.each(['notes', 'cost'], function (v, i) {
    if (data.properties && data.properties[v]) {
      data.properties[v] = data.properties[v].replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '').trim()
    }
  })

  // Non anonymous reports can be updated
  if (_.indexOf(config.deduplication.anon_attributions, data.attribution) === -1) {
    report = yield LooReport.findOneAndUpdate(
      {geohash: ghash, attribution: data.attribution},
      data,
      {upsert: true, new: true}
    ).exec()
  } else {
    // Anon ones get a new report each time
    report = new LooReport(data)
    yield report.save()
  }
  var loo = yield report.looificate()

  return [report, loo]
}

looReportSchema.methods.looificate = function * () {
  var loo = yield LooReport.findLooFor(this)
  if (!loo) {
    // Derive a new loo from this report
    loo = Loo.fromLooReport(this)
  }

  // Ensure that this report is referenced by the loo
  if (loo.reports.indexOf(this._id) === -1) {
    loo.reports.push(this._id)
  }

  // Get the loo to regenerate its data
  yield loo.regenerate()
  // Save the result
  yield loo.save()
  return loo
}

module.exports = LooReport = mongoose.model('LooReport', looReportSchema)
