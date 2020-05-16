const { Schema } = require('mongoose');
const { Point } = require('./geojson');

/**
 * The core schema of a loo and loo report. This is as a function because:
 * - It will give a new object instance each time, protecting against mutation
 * - There may be subtle differences in validation between reports and loos
 * This is volatile work in progress.
 */
module.exports = exports = new Schema({
  _id: false,
  geometry: Point,
  name: { type: String, trim: true },
  active: { type: Boolean },
  access: { type: String },
  opening: { type: String, trim: true },
  type: { type: String },
  accessible: { type: Boolean },
  babyChange: { type: Boolean },
  radar: { type: Boolean },
  attended: { type: Boolean },
  automatic: { type: Boolean },
  fee: { type: String, trim: true },
  notes: { type: String, trim: true },
  removalReason: { type: String, trim: true },
  verifiedAt: { type: Date },
  area: {
    type: [
      {
        type: { type: String },
        name: { type: String },
        _id: false,
      },
    ],
    default: undefined,
  },
});
