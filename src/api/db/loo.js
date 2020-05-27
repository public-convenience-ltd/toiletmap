const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const CoreSchema = require('./core');

const LooSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    properties: CoreSchema,
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NewReport' }],
    createdAt: { type: mongoose.Schema.Types.Date },
    updatedAt: { type: mongoose.Schema.Types.Date },
    contributors: [{ type: mongoose.Schema.Types.String }],
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
LooSchema.statics.fromReports = function (reports, idOverride) {
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
  const reportIds = reports.map((val) => val._id);

  // Calculate the Loo's creation and update time - we sort the report creation times to do this since
  // early reports were ranked on trust as well...
  const timeline = reports
    .map((r) => r.createdAt)
    .sort((d1, d2) => {
      if (d1 > d2) return 1;
      if (d1 < d2) return -1;
      return 0;
    });

  // Use id given or calculate a persistent id for this loo from the first of its reports
  const id = idOverride || reports[0].suggestLooId();

  // "this" refers to our static model
  return new this({
    _id: mongoose.Types.ObjectId(id),
    properties,
    reports: reportIds,
    createdAt: timeline[0],
    updatedAt: timeline[timeline.length - 1],
    contributors: reports.map((r) => r.contributor),
  });
};

LooSchema.statics.findNear = function (lon, lat, radius, complete) {
  let args = [
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
  ];
  if (!complete) {
    args.push({
      $project: {
        distance: 1,
        properties: {
          geometry: 1,
          noPayment: 1,
          accessible: 1,
          openingTimes: 1,
          type: 1,
          babyChange: 1,
        },
      },
    });
  }
  return this.aggregate(args);
};

LooSchema.statics.getCounters = async function () {
  const [activeLoos, totalLoos, multipleReports] = await Promise.all([
    this.countDocuments({ 'properties.active': true }).exec(),
    this.countDocuments().exec(),
    this.countDocuments({ 'reports.1': { $exists: true } }).exec(),
  ]);

  const inactiveLoos = totalLoos - activeLoos;

  // Be careful about changing the names of these - they are linked to the GraphQL schema
  return {
    activeLoos,
    inactiveLoos,
    totalLoos,
    multipleReports,
  };
};

LooSchema.statics.getProportionCounters = async function () {
  const [
    babyChange,
    babyChangeUnknown,
    inaccessibleLoos,
    accessibleLoosUnknown,
    activeLoos,
    totalLoos,
  ] = await Promise.all([
    this.countDocuments({ 'properties.babyChange': true }).exec(),
    this.countDocuments({ 'properties.babyChange': null }).exec(),
    this.countDocuments({ 'properties.accessible': false }).exec(),
    this.countDocuments({
      'properties.accessible': { $exists: false },
    }).exec(),
    this.countDocuments({ 'properties.active': true }).exec(),
    this.countDocuments({}).exec(),
  ]);

  return {
    babyChange,
    babyChangeUnknown,
    inaccessibleLoos,
    accessibleLoosUnknown,
    activeLoos,
    totalLoos,
  };
};

/*
  Returns an array of areas with various statistical counts attached
*/
LooSchema.statics.getAreasCounters = async function () {
  const areas = await this.aggregate([
    {
      $match: {},
    },
    {
      $unwind: '$properties.area',
    },
    {
      $project: {
        areaName: {
          $cond: [
            '$properties.area.name',
            '$properties.area.name',
            'Unknown Area',
          ],
        },
        active: {
          $cond: ['$properties.active', 1, 0],
        },
        babyChange: {
          $cond: [
            {
              $and: [
                { $eq: ['$properties.babyChange', true] },
                { $eq: ['$properties.active', true] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$areaName',
        looCount: {
          $sum: 1,
        },
        activeLooCount: {
          $sum: '$active',
        },
        babyChangeCount: {
          $sum: '$babyChange',
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]).exec();

  return areas;
};

module.exports = new mongoose.model('NewLoo', LooSchema);
