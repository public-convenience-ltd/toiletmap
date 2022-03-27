import { stringifyAndCompressLoos } from '../lib/loo';
import ngeohash from 'ngeohash';

const { Loo, Report, Area, MapGeo } = require('./db');
const { GraphQLDateTime } = require('graphql-iso-date');
const without = require('lodash/without');
const OpeningTimesScalar = require('./OpeningTimesScalar');

const subPropertyResolver = (property) => (parent, args, context, info) =>
  parent[property][info.fieldName];
const looInfoResolver = (property) => {
  let resolve = subPropertyResolver(property);
  return {
    active: resolve,
    area: resolve,
    name: resolve,
    openingTimes: resolve,
    accessible: resolve,
    allGender: resolve,
    men: resolve,
    women: resolve,
    children: resolve,
    urinalOnly: resolve,
    babyChange: resolve,
    radar: resolve,
    attended: resolve,
    automatic: resolve,
    noPayment: resolve,
    paymentDetails: resolve,
    notes: resolve,
    removalReason: resolve,
    verifiedAt: resolve,
  };
};

const resolvers = {
  Query: {
    loo: async (parent, args) => await Loo.findById(args.id),
    loos: async (parent, args, context) => {
      const REQUIRED_PERMISSION = 'VIEW_CONTRIBUTOR_INFO';

      // Construct the search query
      let query = {
        'properties.active': args.filters.active,
      };

      if (args.filters.noPayment) {
        query['properties.noPayment'] = true;
      }

      if (args.filters.areaName) {
        query['properties.area.name'] = args.filters.areaName;
      }

      // Text search for the loo name
      if (args.filters.text) {
        query.$or = [{ $text: { $search: args.filters.text } }];
      }

      // Bound by dates
      if (args.filters.fromDate || args.filters.toDate) {
        query.updatedAt = {};
      }

      if (args.filters.fromDate) {
        query.updatedAt.$gte = args.filters.fromDate;
      }

      if (args.filters.toDate) {
        query.updatedAt.$lte = args.filters.toDate;
      }

      // Check the context for proper auth - we can't allow people to query by contributors when
      // they don't have permission to view who has contributed info for each report
      args.filters.contributors = without(args.filters.contributors, null);
      if (
        args.filters.contributors &&
        args.filters.contributors.length &&
        context.user &&
        context.user[process.env.AUTH0_PERMISSIONS_KEY].includes(
          REQUIRED_PERMISSION
        )
      ) {
        query.$and = [
          {
            contributors: { $all: args.filters.contributors },
          },
        ];
      }

      let res = await Loo.paginate(query, {
        page: args.pagination.page,
        limit: args.pagination.limit,
        sort: args.sort,
      });

      return {
        loos: res.docs,
        total: res.total,
        pages: res.pages,
        limit: res.limit,
        page: res.page,
      };
    },
    looNamesByIds: async (parent, args) =>
      await Loo.find({ _id: { $in: args.idList } }),
    loosByProximity: async (parent, args) =>
      await Loo.findNear(args.from.lng, args.from.lat, args.from.maxDistance),
    loosByGeohash: async (parent, args, context) => {
      const geohash: string = args.geohash ?? '';
      const current = ngeohash.decode_bbox(geohash);

      const areaLooData = await Promise.all(
        [current].map(async (boundingBox) => {
          const [minLat, minLon, maxLat, maxLon] = boundingBox;
          return await Loo.find({ 'properties.active': true })
            .where('properties.geometry')
            .box([minLon, minLat], [maxLon, maxLat]);
        })
      );

      return stringifyAndCompressLoos(areaLooData.flat());
    },
    ukLooMarkers: async () => {
      const loos = await Loo.find({ 'properties.active': true })
        .where('properties.geometry')
        .within({
          type: 'Polygon',
          coordinates: [
            [
              [-0.3515625, 61.44927080076419],
              [-15.5126953125, 55.7642131648377],
              [-7.66845703125, 48.151428143221224],
              [2.35107421875, 51.34433866059924],
              [-0.3515625, 61.44927080076419],
            ],
          ],
        });
      return stringifyAndCompressLoos(loos);
    },
    areas: async (parent, args) => {
      const data = await Area.find({}, { name: 1, type: 1 }).exec();

      const areas = data.map((area) => {
        return {
          type: area.type,
          name: area.name,
        };
      });

      return areas;
    },
    mapAreas: async (parent, args) => {
      let query = {};
      if (args.areaType) {
        query = { areaType: args.areaType };
      }
      const geo = await MapGeo.findOne(query).exec();

      if (!geo) {
        return null;
      }

      let geometry = geo.geometry;

      geometry.objects.forEach((obj) => {
        obj.value.geometries.forEach((geom) => {
          geom.properties = JSON.stringify(geom.properties);
          if (typeof geom.arcs[0][0] === 'number') {
            geom.arcs = [geom.arcs];
          }
          geom.type = 'MultiPolygon';
        });
      });

      return geometry;
    },
    report: async (parent, args) => {
      const id = args.id;
      return await Report.findById(id);
    },
    counters: async (parent, args) => {
      let looCounters = await Loo.getCounters();
      let reportCounters = await Report.getCounters();

      return {
        ...looCounters,
        ...reportCounters,
      };
    },
    proportions: async (parent, args) => {
      const {
        babyChange,
        babyChangeUnknown,
        inaccessibleLoos,
        accessibleLoosUnknown,
        activeLoos,
        totalLoos,
      } = await Loo.getProportionCounters();

      return {
        activeLoos: [
          { name: 'active', value: activeLoos },
          { name: 'inactive', value: totalLoos - activeLoos },
          { name: 'unknown', value: 0 },
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
      const areas = await Loo.getAreasCounters();

      return areas.map((area) => {
        return {
          area: {
            name: area._id,
          },
          totalLoos: area.looCount,
          activeLoos: area.activeLooCount,
          babyChangeLoos: area.babyChangeCount,
        };
      });
    },
    contributors: async (parent, args) => {
      const contributors = await Report.aggregate([
        {
          $match: { contributor: { $exists: true } },
        },
        {
          $group: {
            _id: '$contributor',
            reports: {
              $sum: 1,
            },
          },
        },
      ]).exec();

      return contributors.map((val) => ({ name: val._id }));
    },
  },

  MutationResponse: {
    __resolveType(mutationResponse, context, info) {
      return null;
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
          coordinates: [location.lng, location.lat], // flip coords, stored differently in db
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
    submitVerificationReport: async (parent, args, context) => {
      const report = {
        verifiedAt: new Date(),
      };

      try {
        const result = await Report.submit(report, null, args.id);
        return {
          code: '200',
          success: true,
          message: 'Toilet data verified',
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
    id: (r) => r._id.toString(),
    previous: (r) => Report.findById(r.previous),
    location: (r) =>
      r.diff.geometry && {
        lng: r.diff.geometry.coordinates[0],
        lat: r.diff.geometry.coordinates[1],
      },
    ...looInfoResolver('diff'),
    loo: (r) => r.getLoo(),
  },

  Loo: {
    id: (l) => l._id.toString(),
    reports: (l) => Report.find().where('_id').in(l.reports).exec(),
    location: (l) => ({
      lng: l.properties.geometry.coordinates[0],
      lat: l.properties.geometry.coordinates[1],
    }),
    ...looInfoResolver('properties'),
  },

  DateTime: GraphQLDateTime,

  SortOrder: {
    NEWEST_FIRST: { updatedAt: 'desc' },
    OLDEST_FIRST: { updatedAt: 'asc' },
  },

  OpeningTimes: OpeningTimesScalar,
};

module.exports = resolvers;
