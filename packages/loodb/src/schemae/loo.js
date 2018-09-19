const { Schema } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const CoreSchema = require('./core');

const LooSchema = new Schema(
  {
    properties: CoreSchema,
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

  // "this" refers to our static model
  return new this({ properties });
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
        geometry: 1,
        distance: 1,
        properties: {
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
