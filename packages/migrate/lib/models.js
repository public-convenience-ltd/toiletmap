const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

// our APIs old models
const LegacyLoo = require('@neontribe/gbptm-api/src/models/loo');
const LegacyReport = require('@neontribe/gbptm-api/src/models/loo_report');

/**
 * The core schema of a loo and loo report. This is as a function because:
 * - It will give a new object instance each time, protecting against mutation
 * - There may be subtle differences in validation between reports and loos
 * This is volatile work in progress.
 */
function getCoreSchema() {
  return {
    geometry: {
      type: {
        type: String,
        required: '"{PATH}" should be "Point" and is required',
      },
      coordinates: [{ type: 'Number' }],
    },
    name: { type: String, trim: true, minlength: 1 },
    active: { type: Boolean, default: true },
    access: { type: String, default: 'public' },
    opening: { type: String, trim: true, minlength: 1 },
    type: { type: String },
    accessibleType: { type: String },
    babyChange: { type: String },
    radar: { type: String },
    attended: { type: String },
    automatic: { type: String },
    fee: { type: String, trim: true, minlength: 1 },
    notes: { type: String, trim: true, minlength: 1 },
    removal_reason: { type: String, trim: true, minlength: 1 },
    area: [
      {
        type: { type: String },
        name: { type: String },
      },
    ],
  };
}

exports.Report = mongoose.model(
  'Report',
  new Schema({
    previous: { type: Schema.Types.ObjectId, ref: 'Report' },
    next: { type: Schema.Types.ObjectId, ref: 'Report' },
    diff: getCoreSchema(),
  })
);
exports.LegacyLoo = LegacyLoo;
exports.LegacyReport = LegacyReport;
