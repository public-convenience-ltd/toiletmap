/* eslint-disable functional/immutable-data */
import { stringifyAndCompressLoos } from '../lib/loo';
import { Resolvers } from './resolvers-types';
import { Loo as DBLoo, Report as DBReport, MapGeo, dbConnect } from './db';
import { GraphQLDateTime } from 'graphql-iso-date';
import OpeningTimesScalar from './OpeningTimesScalar';
import { Context } from './prisma/prismaContext';
import { toilets, areas } from '@prisma/client';
import { Loo } from '../api-client/graphql';

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

const convertPostgresLooToGraphQL = (
  loo: toilets,
  area?: Partial<areas>
): Loo => ({
  id: loo.legacy_id,
  women: loo.women,
  men: loo.men,
  name: loo.name,
  noPayment: loo.no_payment,
  notes: loo.notes,
  openingTimes: loo.opening_times,
  paymentDetails: loo.payment_details,
  accessible: loo.accessible,
  active: loo.active,
  allGender: loo.all_gender,
  area: [area],
  attended: loo.attended,
  automatic: loo.automatic,
  babyChange: loo.baby_change,
  children: loo.children,
  createdAt: loo.created_at,
  location: { lat: loo.location[0], lng: loo.location[1] },
  removalReason: loo.removal_reason,
  radar: loo.radar,
  urinalOnly: loo.urinal_only,
  verifiedAt: loo.verified_at,
  reports: [],
  updatedAt: loo.updated_at,
});

const resolvers: Resolvers<Context> = {
  Query: {
    loo: async (_parent, args, { prisma }) => {
      const loo = await prisma.toilets.findUnique({
        include: { areas: { select: { name: true, type: true } } },
        where: { legacy_id: args.id },
      });
      return convertPostgresLooToGraphQL(loo, loo.areas);
    },
    loos: async (_parent, args, { prisma }) => {
      const loos = await prisma.toilets.findMany({
        include: { areas: { select: { name: true, type: true } } },
        where: {
          active: args.filters.active ?? false,
          no_payment: args.filters.noPayment ? true : undefined,
          areas: {
            name: {
              equals: args.filters.areaName,
            },
          },
          updated_at: {
            gte: args.filters.fromDate,
            lte: args.filters.toDate,
          },
          OR: [
            {
              name: {
                mode: 'insensitive',
                contains: args.filters.text,
              },
            },
          ],
        },
      });

      // TODO: Get this to work with Prisma

      // const REQUIRED_PERMISSION = 'VIEW_CONTRIBUTOR_INFO';
      // Check the context for proper auth - we can't allow people to query by contributors when
      // they don't have permission to view who has contributed info for each report
      // args.filters.contributors = without(args.filters.contributors, null);
      // if (
      //   args.filters.contributors &&
      //   args.filters.contributors.length &&
      //   context.user &&
      //   context.user[process.env.AUTH0_PERMISSIONS_KEY].includes(
      //     REQUIRED_PERMISSION
      //   )
      // ) {
      //   query.$and = [
      //     {
      //       contributors: { $all: args.filters.contributors },
      //     },
      //   ];
      // }

      // TODO: Get pagination to work with Prisma

      // const res = await DBLoo.paginate(query, {
      //   page: args.pagination.page,
      //   limit: args.pagination.limit,
      //   sort: args.sort,
      // });

      return {
        loos: loos.map((loo) => convertPostgresLooToGraphQL(loo)),
        total: loos.length,
        pages: 1,
        limit: 1,
        page: 1,
      };
    },
    looNamesByIds: async (_parent, args, { prisma }) => {
      return (
        await prisma.toilets.findMany({
          where: {
            legacy_id: {
              in: args.idList,
            },
          },
          select: {
            legacy_id: true,
            name: true,
          },
        })
      ).map((loo) => ({ id: loo.legacy_id, name: loo.name }));
    },
    loosByProximity: async (_parent, args, { prisma }) => {
      const nearbyLoos = (await prisma.$queryRaw`
        SELECT
          loo.legacy_id,
          loo.name,
          active,
          men,
          women,
          no_payment,
          notes,
          opening_times,
          payment_details,
          accessible,
          active,
          all_gender,
          attended,
          automatic,
          location,
          baby_change,
          children,
          created_at,
          removal_reason,
          radar,
          urinal_only,
          verified_at,
          updated_at,
          st_distancesphere(
            geography::geometry,
            ST_MakePoint(${args.from.lng}, ${args.from.lat})
          ) as distance,
          area.name as area_name,
          area.type as area_type from toilets loo inner join areas area on area.id = loo.area_id
          where st_distancesphere(
            loo.geography::geometry,
            ST_MakePoint(${args.from.lng}, ${args.from.lat})
          ) <= ${args.from.maxDistance ?? 1000}
      `) as (toilets & {
        distance: number;
        area_name?: string;
        area_type?: string;
      })[];

      // TODO: Zod to verify this?

      return (
        nearbyLoos?.map((loo) => {
          const hasArea = loo?.area_name && loo?.area_type;
          const area = hasArea
            ? { name: loo?.area_name, type: loo?.area_type }
            : undefined;
          return { ...convertPostgresLooToGraphQL(loo, area) };
        }) ?? []
      );
    },
    loosByGeohash: async (_parent, args, { prisma }) => {
      const loos = await prisma.toilets.findMany({
        where: {
          geohash: {
            startsWith: args.geohash,
          },
          AND: [
            {
              active: {
                equals: args.active,
              },
            },
          ],
        },
      });

      return stringifyAndCompressLoos(
        loos.map((loo) => convertPostgresLooToGraphQL(loo)).flat()
      );
    },
    areas: async (_parent, args, { prisma }) => {
      const areas = await prisma.areas.findMany({
        select: {
          name: true,
          type: true,
        },
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

  Loo: {},

  DateTime: GraphQLDateTime,

  SortOrder: {
    NEWEST_FIRST: { updatedAt: 'desc' },
    OLDEST_FIRST: { updatedAt: 'asc' },
  },

  OpeningTimes: OpeningTimesScalar,
};

export const DateTime = resolvers.DateTime;
export const Mutation = resolvers.Mutation;
export const MutationResponse = resolvers.MutationResponse;
export const OpeningTimes = resolvers.OpeningTimes;
export const Query = resolvers.Query;
export const Report = resolvers.Report;
export const SortOrder = resolvers.SortOrder;
