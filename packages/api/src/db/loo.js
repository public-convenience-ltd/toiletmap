const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const CoreSchema = require('./core');

const LooSchema = new Schema(
  {
    properties: CoreSchema,
    reports: [{ type: Schema.Types.ObjectId, ref: 'NewReport' }],
    createdAt: { type: Schema.Types.Date },
    updatedAt: { type: Schema.Types.Date },
    contributors: [{ type: Schema.Types.String }],
  },
  { minimize: false }
);

LooSchema.index({ 'properties.geometry': '2dsphere' });
// add text index for search API endpoint
LooSchema.index(
  { 'properties.name': 'text', 'properties.notes': 'text' },
  { default_language: 'none' }
);
LooSchema.plugin(mongoosePaginate);

/**
 * Create a Loo from a list of LooReports.
 */
LooSchema.statics.fromReports = function(reports) {
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

  // Get just the IDs of the report list to populate Loo metadata
  const reportIds = reports.map(val => val._id);

  // Calculate the Loo's creation and update time - we sort the report creation times to do this since
  // early reports were ranked on trust as well...
  const timeline = reports.map(r => r.createdAt).sort((d1, d2) => {
    if (d1 > d2) return 1;
    if (d1 < d2) return -1;
    return 0;
  });

  // "this" refers to our static model
  return new this({
    properties,
    reports: reportIds,
    createdAt: timeline[0],
    updatedAt: timeline[timeline.length - 1],
    contributors: reports.map(r => r.contributor),
  });
};

LooSchema.statics.findNear = function(lon, lat, radius) {
  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        distanceField: 'distance',
        maxDistance: radius,
        spherical: true,
        limit: 2 ** 62, // infeasibly large number
      },
    },
    {
      $match: {
        'properties.active': true,
      },
    },
    {
      $project: {
        distance: 1,
        properties: {
          geometry: 1,
          fee: 1,
          accessibleType: 1,
          opening: 1,
          type: 1,
          babyChange: 1,
        },
      },
    },
  ]);
};

module.exports = exports = LooSchema;
