const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const CoreSchema = require('./core');

const LooSchema = new Schema(
  {
    properties: CoreSchema,
    reports: [{ type: Schema.Types.ObjectId, ref: 'NewReport' }],
  },
  { minimize: false }
);

LooSchema.index({ 'properties.geometry': '2dsphere' });
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

  // "this" refers to our static model
  return new this({
    properties,
    reports: reportIds,
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

LooSchema.statics.looList = function(loos) {
  return {
    type: 'FeatureCollection',
    features: loos || [],
  };
};

module.exports = exports = LooSchema;
