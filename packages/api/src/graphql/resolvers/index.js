const config = require('../../config');
const { Loo, Report } = require('../../db')(config.mongo.url);
const { GraphQLDateTime } = require('graphql-iso-date');
const scopeQuery = require('./scopeQuery');

const subPropertyResolver = property => (parent, args, context, info) =>
  parent[property][info.fieldName];
const looInfoResolver = property => {
  let resolve = subPropertyResolver(property);
  return {
    active: resolve,
    area: resolve,
    name: resolve,
    access: resolve,
    opening: resolve,
    type: resolve,
    accessibleType: resolve,
    babyChange: resolve,
    radar: resolve,
    attended: resolve,
    automatic: resolve,
    fee: resolve,
    notes: resolve,
    removalReason: resolve,
  };
};

const resolvers = {
  Query: {
    loo: (parent, args) => Loo.findById(args.id),
    loos: async (parent, args) => {
      let query = {
        'properties.fee': { $exists: args.filters.fee },
        'properties.active': args.filters.active,
      };

      let res = await Loo.paginate(query, {
        page: args.pagination.page,
        limit: args.pagination.limit,
        sort: {
          updatedAt: 'desc',
        },
      });
      return {
        loos: res.docs,
        total: res.total,
        pages: res.pages,
        limit: res.limit,
        page: res.page,
      };
    },
    loosByProximity: (parent, args) =>
      Loo.findNear(
        args.from.lng,
        args.from.lat,
        args.from.maxDistance,
        'complete'
      ),
    counters: async (parent, args) => {
      const qWithInactive = { includeInactive: true };
      const [
        activeLoos,
        totalLoos,
        totalReports,
        removalReports,
        multipleReports,
      ] = await Promise.all([
        Loo.countDocuments(scopeQuery({}, {})).exec(),
        Loo.countDocuments(scopeQuery({}, qWithInactive)).exec(),
        Report.countDocuments(scopeQuery({}, qWithInactive)).exec(),
        Report.countDocuments(
          scopeQuery({ 'diff.active': false }, qWithInactive)
        ).exec(),
        Loo.countDocuments(
          scopeQuery({ 'reports.1': { $exists: true } }, qWithInactive)
        ).exec(),
      ]);

      const inactiveLoos = totalLoos - activeLoos;

      return {
        activeLoos,
        inactiveLoos,
        totalLoos,
        totalReports,
        removalReports,
        multipleReports,
      };
    },
    proportions: async (parent, args) => {
      const [
        publicLoos,
        unknownAccessLoos,
        babyChange,
        babyChangeUnknown,
        inaccessibleLoos,
        accessibleLoosUnknown,
        activeLoos,
        totalLoos,
      ] = await Promise.all([
        Loo.countDocuments({ 'properties.access': 'public' }).exec(),
        Loo.countDocuments({ 'properties.access': 'none' }).exec(),
        Loo.countDocuments({ 'properties.babyChange': true }).exec(),
        Loo.countDocuments({ 'properties.babyChange': null }).exec(),
        Loo.countDocuments({ 'properties.accessibleType': 'none' }).exec(),
        Loo.countDocuments({
          'properties.accessibleType': { $exists: false },
        }).exec(),
        Loo.countDocuments({ 'properties.active': true }).exec(),
        Loo.countDocuments({}).exec(),
      ]);

      return {
        activeLoos: [
          { name: 'active', value: activeLoos },
          { name: 'inactive', value: totalLoos - activeLoos },
          { name: 'unknown', value: 0 },
        ],
        publicLoos: [
          { name: 'public', value: publicLoos },
          {
            name: 'restricted',
            value: totalLoos - (publicLoos + unknownAccessLoos),
          },
          { name: 'unknown', value: unknownAccessLoos },
        ],
        babyChanging: [
          { name: 'yes', value: babyChange },
          { name: 'no', value: totalLoos - (babyChange + babyChangeUnknown) },
          { name: 'unknown', value: babyChangeUnknown },
        ],
        accessibleLoos: [
          {
            name: 'accessible',
            value: totalLoos - (inaccessibleLoos + accessibleLoosUnknown),
          },
          { name: 'inaccessible', value: inaccessibleLoos },
          { name: 'unknown', value: accessibleLoosUnknown },
        ],
      };
    },
    areaStats: async (parent, args) => {
      const scope = scopeQuery({}, { includeInactive: true });
      const areas = await Loo.aggregate([
        {
          $match: scope,
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
            public: {
              $cond: [
                {
                  $eq: ['$properties.access', 'public'],
                },
                1,
                0,
              ],
            },
            permissive: {
              $cond: [
                {
                  $eq: ['$properties.access', 'permissive'],
                },
                1,
                0,
              ],
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
            publicLooCount: {
              $sum: '$public',
            },
            permissiveLooCount: {
              $sum: '$permissive',
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

      return areas.map(area => {
        return {
          area: {
            name: area._id,
          },
          totalLoos: area.looCount,
          activeLoos: area.activeLooCount,
          publicLoos: area.publicLooCount,
          permissiveLoos: area.permissiveLooCount,
          babyChangeLoos: area.babyChangeCount,
        };
      });
    },
  },

  Mutation: {
    submitReport: async (parent, args, context) => {
      let user = context.user;
      let { edit, location, ...data } = args.report;
      // Format report data to match old api
      let report = {
        ...data,
        active: true,
        geometry: {
          type: 'Point',
          coordinates: [location.lat, location.lng],
        },
      };

      try {
        let result = await Report.submit(report, user, edit);
        return {
          code: '200',
          success: true,
          message: 'Report processed',
          report: result[0],
          loo: result[1],
        };
      } catch (e) {
        return {
          code: '400',
          success: false,
          message: e,
        };
      }
    },
    submitRemovalReport: async (parent, args, context) => {
      const user = context.user;
      let { edit, reason } = args.report;
      // We sadly need the current geometry here
      const loo = await Loo.findById(edit);
      const coordinates = loo.properties.geometry.coordinates;
      // Format report data to match old api
      let report = {
        active: false,
        removalReason: reason,
        geometry: {
          type: 'Point',
          coordinates,
        },
      };

      try {
        let result = await Report.submit(report, user, edit);
        return {
          code: '200',
          success: true,
          message: 'Report processed',
          report: result[0],
          loo: result[1],
        };
      } catch (e) {
        return {
          code: '400',
          success: false,
          message: e,
        };
      }
    },
  },

  Report: {
    id: r => r._id.toString(),
    previous: r => Report.findById(r.previous),
    location: r =>
      r.diff.geometry && {
        lng: r.diff.geometry.coordinates[0],
        lat: r.diff.geometry.coordinates[1],
      },
    ...looInfoResolver('diff'),
    loo: r => r.getLoo(),
  },

  Loo: {
    id: l => l._id.toString(),
    reports: l =>
      Report.find()
        .where('_id')
        .in(l.reports)
        .exec(),
    location: l => ({
      lng: l.properties.geometry.coordinates[0],
      lat: l.properties.geometry.coordinates[1],
    }),
    ...looInfoResolver('properties'),
  },

  DateTime: GraphQLDateTime,

  AccessPermission: {
    PUBLIC: 'public',
    PERMISSIVE: 'permissive',
    CUSTOMERS_ONLY: 'customers only',
    PRIVATE: 'none',
  },

  Facilities: {
    FEMALE: 'female',
    MALE: 'male',
    FEMALE_AND_MALE: 'female and male',
    UNISEX: 'unisex',
    MALE_URINAL: 'male urinal',
    CHILDREN: 'children only',
    NONE: 'none',
  },
};

module.exports = resolvers;
