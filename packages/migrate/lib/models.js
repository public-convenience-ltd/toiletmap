const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

// our APIs old models
const LegacyLoo = require('@neontribe/gbptm-api/src/models/loo');
const LegacyReport = require('@neontribe/gbptm-api/src/models/loo_report');

function ofLength(n) {
  return [list => list.length == n, `{PATH} must be of length ${n}`];
}

/**
 * The core schema of a loo and loo report. This is as a function because:
 * - It will give a new object instance each time, protecting against mutation
 * - There may be subtle differences in validation between reports and loos
 * This is volatile work in progress.
 */
function getCoreSchema() {
  return {
    geometry: new Schema({
      type: {
        type: String,
        enum: ['Point'],
        required: () => this.geometry,
      },
      coordinates: {
        type: [Number],
        required: () => this.geometry,
        validate: ofLength(2),
      },
      _id: false,
    }),
    name: { type: String, trim: true, minlength: 1 },
    active: { type: Boolean },
    access: { type: String },
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
  };
}

const LooSchema = new Schema(
  {
    properties: getCoreSchema(),
  },
  { minimize: false }
);

/**
 * Create a Loo from a list of LooReports.
 */
LooSchema.statics.fromReports = async function(reports) {
  // generate the loo from the sequence of diffs
  const properties = {};
  for (const rep of reports) {
    for (const [key, value] of Object.entries(rep.toObject().diff)) {
      if (value === null) {
        // null indicates that the value was unset in this report
        delete properties[key];
      } else if (value !== undefined) {
        // otherwise, if we have a valid property, update it within the loo
        properties[key] = value;
      }
    }
  }

  // we haven't defined our model yet, so we must reference it by name
  return new (mongoose.model('NewLoo'))({ properties });
};

const ReportSchema = new Schema(
  {
    previous: { type: Schema.Types.ObjectId, ref: 'Report' },
    next: { type: Schema.Types.ObjectId, ref: 'Report' },
    diff: getCoreSchema(),
  },
  { minimize: false }
);

/**
 * Strictly check that a report is valid, beyond what we can do in the schema:
 * - Ensure that any reference to the "next" report points to a suitable candidate
 * - Ensure that any reference to the "previous" report points to a suitable candidate
 * - Generate a loo from previous reports and check for redundant values
 * - Generate a loo from previous reports and check if unsetting values is done in a valid place
 */
ReportSchema.pre('validate', async function() {
  // if the loo has a report following it...
  if (this.next) {
    const next = await mongoose.model('Report').findById(this.next);

    // check it exists
    if (!next) {
      throw new Error(`'next' report ${this.next} does not exist`);
    }

    // check that it references us as the previous report
    if (!next.previous.equals(this._id)) {
      throw new Error(
        `'next' report ${this.next} refers to wrong previous report, ${
          next.previous
        }`
      );
    }
  }

  // if the loo has a report preceding it...
  let previous;
  if (this.previous) {
    previous = await mongoose.model('Report').findById(this.previous);

    // check that it exists
    if (!previous) {
      throw new Error(`'previous' report ${this.previous} does not exist`);
    }
  }

  // find all reports preceding this one
  let allPrevious = [];
  while (previous) {
    allPrevious.unshift(previous); // add to beginning, keeping in order
    await mongoose.model('Report').populate(previous, { path: 'previous' });
    previous = previous.previous;
  }

  // generate a loo from previous reports
  const looBefore = await mongoose.model('NewLoo').fromReports(allPrevious);

  for (const key of Object.keys(this.toObject().diff)) {
    if (this.diff[key] === null) {
      if (looBefore.properties[key] === undefined) {
        // we can't remove a property if it wasn't defined previously
        throw Error(
          `Report unsets property '${key}' that was not set in loo to begin with`
        );
      }

      if (this.toObject().diff[key] === looBefore.toObject().properties[key]) {
        // we can't have a duplicate property value - it gives no further information
        throw Error(
          `Report sets property '${key}' to the same value it was before`
        );
      }
    }
  }
});

exports.Loo = mongoose.model('NewLoo', LooSchema);
exports.Report = mongoose.model('Report', ReportSchema);
exports.LegacyLoo = LegacyLoo;
exports.LegacyReport = LegacyReport;
