const config = require('../../config');
const { Loo, Report } = require('../../db')(config.mongo.url);
const { GraphQLDateTime } = require('graphql-iso-date');

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
    loosByProximity: (parent, args) =>
      Loo.findNear(
        args.from.lng,
        args.from.lat,
        args.from.maxDistance,
        'complete'
      ),
  },

  Mutation: {
    submitReport: (parent, args, context) => {
      //let input = args.report;
      // Do stuff
      return {
        code: '201',
        success: true,
        message: 'Not gonna do anything yet',
      };
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
