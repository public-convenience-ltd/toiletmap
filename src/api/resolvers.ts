/* eslint-disable functional/immutable-data */
import { stringifyAndCompressLoos } from '../lib/loo';
import ngeohash from 'ngeohash';
import { Resolvers } from './resolvers-types';
import {
  Loo as DBLoo,
  Report as DBReport,
  Area,
  MapGeo,
  dbConnect,
} from './db';
import { GraphQLDateTime } from 'graphql-iso-date';
import without from 'lodash/without';
import OpeningTimesScalar from './OpeningTimesScalar';

const subPropertyResolver = (property) => (parent, _args, _context, info) =>
  parent[property][info.fieldName];
const looInfoResolver = (property) => {
  const resolve = subPropertyResolver(property);
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

const resolvers: Resolvers = {
  Query: {
    loo: async (_parent, args) => {
      await dbConnect();
      return await DBLoo.findById(args.id);
    },
    loos: async (_parent, args, context) => {
      await dbConnect();

      const REQUIRED_PERMISSION = 'VIEW_CONTRIBUTOR_INFO';

      // Construct the search query
      const query = {
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

      const res = await DBLoo.paginate(query, {
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
    looNamesByIds: async (_parent, args) => {
      await dbConnect();
      return await DBLoo.find({ _id: { $in: args.idList } });
    },
    loosByProximity: async (_parent, args) => {
      await dbConnect();
      return await DBLoo.findNear(
        args.from.lng,
        args.from.lat,
        args.from.maxDistance
      );
    },
    loosByGeohash: async (_parent, args) => {
      await dbConnect();
      const geohash: string = args.geohash ?? '';
      const current = ngeohash.decode_bbox(geohash);

      const areaLooData = await Promise.all(
        [current].map(async (boundingBox) => {
          const [minLat, minLon, maxLat, maxLon] = boundingBox;
          return await DBLoo.find({ 'properties.active': true })
            .where('properties.geometry')
            .box([minLon, minLat], [maxLon, maxLat]);
        })
      );

      return stringifyAndCompressLoos(areaLooData.flat());
    },
    ukLooMarkers: async () => {
      await dbConnect();
      const loos = await DBLoo.find({ 'properties.active': true })
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
    areas: async () => {
      await dbConnect();
      const data = await Area.find({}, { name: 1, type: 1 }).exec();

      const areas = data.map((area) => {
        return {
          type: area.type,
          name: area.name,
        };
      });

      return areas;
    },
    mapAreas: async () => {
      await dbConnect();
      let query = {};
      if (args.areaType) {
        query = { areaType: args.areaType };
      }
      const geo = await MapGeo.findOne(query).exec();

      if (!geo) {
        return null;
      }

      const geometry = geo.geometry;

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
    report: async (_parent, args) => {
      await dbConnect();
      const id = args.id;
      return await DBReport.findById(id);
    },
    counters: async () => {
      await dbConnect();
      const looCounters = await DBLoo.getCounters();
      const reportCounters = await DBReport.getCounters();

      return {
        ...looCounters,
        ...reportCounters,
      };
    },
    proportions: async () => {
      await dbConnect();
      const {
        babyChange,
        babyChangeUnknown,
        inaccessibleLoos,
        accessibleLoosUnknown,
        activeLoos,
        totalLoos,
      } = await DBLoo.getProportionCounters();

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
    areaStats: async () => {
      await dbConnect();
      const areas = await DBLoo.getAreasCounters();

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
    contributors: async () => {
      await dbConnect();
      const contributors = await DBReport.aggregate([
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
    __resolveType() {
      return null;
    },
  },

  Mutation: {
    submitReport: async (_parent, args, context) => {
      await dbConnect();
      const user = context.user;
      const { edit, location, ...data } = args.report;
      // Format report data to match old api
      const report = {
        ...data,
        active: true,
        geometry: {
          type: 'Point',
          coordinates: [location.lng, location.lat], // flip coords, stored differently in db
        },
      };

      try {
        const result = await DBReport.submit(report, user, edit);
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
    submitRemovalReport: async (_parent, args, context) => {
      await dbConnect();
      const user = context.user;
      const { edit, reason } = args.report;
      // We sadly need the current geometry here
      const loo = await DBLoo.findById(edit);
      const coordinates = loo.properties.geometry.coordinates;
      // Format report data to match old api
      const report = {
        active: false,
        removalReason: reason,
        geometry: {
          type: 'Point',
          coordinates,
        },
      };

      try {
        const result = await DBReport.submit(report, user, edit);
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
    submitVerificationReport: async (_parent, args) => {
      await dbConnect();
      const report = {
        verifiedAt: new Date(),
      };

      try {
        const result = await DBReport.submit(report, null, args.id);
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
    previous: (r) => DBReport.findById(r.previous),
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
    reports: (l) => DBReport.find().where('_id').in(l.reports).exec(),
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

export const DateTime = resolvers.DateTime;
export const Loo = resolvers.Loo;
export const Mutation = resolvers.Mutation;
export const MutationResponse = resolvers.MutationResponse;
export const OpeningTimes = resolvers.OpeningTimes;
export const Query = resolvers.Query;
export const Report = resolvers.Report;
export const SortOrder = resolvers.SortOrder;
