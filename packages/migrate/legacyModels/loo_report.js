const mongoose = require('mongoose');
const config = require('./config/config');
const Loo = require('./loo');
const looReportSchema = require('./loo_schema').looReportSchema;
var LooReport;

/**
 * Find the loo to which this report is attatched, or a nearby loo
 */
looReportSchema.statics.findLooFor = async function(report) {
  var loo;
  // Is this report derived from an existing loo?
  if (report.derivedFrom) {
    loo = await Loo.findById(report.derivedFrom).exec();
  }

  if (!loo) {
    // Do we have a loo which references this report?
    loo = await Loo.findOne({ reports: { $in: [report._id] } }).exec();
  }

  if (!loo) {
    // Nope. How about one which is within x meters (and so is probably the same real loo)
    loo = await Loo.findOne({
      geometry: {
        $near: {
          $geometry: report.geometry.toJSON(),
          $maxDistance: config.deduplication.radius,
        },
      },
    }).exec();
  }
  return loo;
};

looReportSchema.statics.processReport = async function(data) {
  // Strip tags from plain text entries
  // this is a bit basic...
  ['notes', 'cost'].forEach(function(v) {
    if (data.properties && data.properties[v]) {
      data.properties[v] = data.properties[v]
        .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi, '')
        .trim();
    }
  });

  const report = new LooReport(data);
  await report.save();
  var loo = await report.looificate();
  return [report, loo];
};

looReportSchema.methods.looificate = async function() {
  var loo = await LooReport.findLooFor(this);
  if (!loo) {
    // Derive a new loo from this report
    loo = Loo.fromLooReport(this);
  }

  // Ensure that this report is referenced by the loo
  if (loo.reports.indexOf(this._id) === -1) {
    loo.reports.push(this._id);
  }

  // Get the loo to regenerate its data
  await loo.regenerate();
  // Save the result
  await loo.save();
  return loo;
};

module.exports = LooReport = mongoose.model('LooReport', looReportSchema);
