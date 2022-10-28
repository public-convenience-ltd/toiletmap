import { stringifyAndCompressLoos } from '../lib/loo';
import { Resolvers } from './resolvers-types';
import { Loo as DBLoo, Report as DBReport, dbConnect } from './db';
import { GraphQLDateTime } from 'graphql-iso-date';
import OpeningTimesScalar from './OpeningTimesScalar';
import { Context } from './prisma/prismaContext';
import { toilets, areas } from '@prisma/client';
import { Loo } from '../api-client/graphql';
import {
  getLooById,
  getLooNamesByIds,
  getLoosByProximity,
} from './prisma/queries';

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
  loo: toilets & { areas?: Partial<areas> }
): Loo => ({
  id: loo.id.toString(),
  legacy_id: loo.legacy_id,
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
  area: [loo?.areas],
  attended: loo.attended,
  automatic: loo.automatic,
  babyChange: loo.baby_change,
  children: loo.children,
  createdAt: loo.created_at,
  location: {
    lat: loo.location.coordinates[1],
    lng: loo.location.coordinates[0],
  },
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
      const isLegacyId = isNaN(args.id as unknown as number);
      if (isLegacyId) {
        return convertPostgresLooToGraphQL(await getLooById(prisma, args.id));
      }

      return convertPostgresLooToGraphQL(
        await getLooById(prisma, parseInt(args.id))
      );
    },
    looNamesByIds: async (_parent, args, { prisma }) => {
      const looNames = await getLooNamesByIds(prisma, args.idList);
      return looNames.map((loo) => ({ id: loo.id.toString(), name: loo.name }));
    },
    loosByProximity: async (_parent, args, { prisma }) => {
      const result = await getLoosByProximity(
        prisma,
        args.from.lat,
        args.from.lng,
        args.from.maxDistance
      );
      return result.map(convertPostgresLooToGraphQL);
    },
    loosByGeohash: async (_parent, args, { prisma }) =>
      stringifyAndCompressLoos(
        (
          await prisma.toilets.findMany({
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
          })
        )
          .map(convertPostgresLooToGraphQL)
          .flat()
      ),

    areas: async (_parent, args, { prisma }) =>
      await prisma.areas.findMany({
        select: {
          name: true,
          type: true,
        },
      }),
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

  OpeningTimes: OpeningTimesScalar,
};

export const DateTime = resolvers.DateTime;
export const Mutation = resolvers.Mutation;
export const MutationResponse = resolvers.MutationResponse;
export const OpeningTimes = resolvers.OpeningTimes;
export const Query = resolvers.Query;
export const Report = resolvers.Report;
