import { stringifyAndCompressLoos } from '../lib/loo';
import { Resolvers } from './resolvers-types';
import { Loo as DBLoo, Report as DBReport, dbConnect } from './db';
import { GraphQLDateTime } from 'graphql-iso-date';
import OpeningTimesScalar from './OpeningTimesScalar';
import { toilets } from '@prisma/client';
import { async as hasha } from 'hasha';

import {
  decideAndSetLooArea,
  getLooById,
  getLooNamesByIds,
  getLoosByProximity,
  postgresLooToGraphQL,
  setLooLocation,
} from './prisma/queries';
import { Context } from './context';

const resolvers: Resolvers<Context> = {
  Query: {
    loo: async (_parent, args, { prisma }) => {
      const isLegacyId = isNaN(args.id as unknown as number);
      if (isLegacyId) {
        return postgresLooToGraphQL(await getLooById(prisma, args.id));
      }

      return postgresLooToGraphQL(await getLooById(prisma, parseInt(args.id)));
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

      return result.map(postgresLooToGraphQL);
    },
    loosByGeohash: async (_parent, args, { prisma }) =>
      // TODO: check if running this q against  postgis direct is faster
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
          .map(postgresLooToGraphQL)
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
    submitReport: async (_parent, args, { prisma, user }) => {
      const { edit: id, location, ...report } = args.report;

      const mappedData = {
        accessible: report.accessible,
        active: true,
        attended: report.attended,
        automatic: report.automatic,
        baby_change: report.babyChange,
        men: report.men,
        no_payment: report.noPayment,
        notes: report.notes,
        payment_details: report.paymentDetails,
        radar: report.radar,
        women: report.women,
        updated_at: new Date(),
        urinal_only: report.urinalOnly,
        all_gender: report.allGender,
        children: report.children,
        opening_times: report.openingTimes ?? undefined,
        verified_at: new Date(),
        name: report.name,
      } as toilets;

      // Remove undefined values.
      Object.keys(mappedData).forEach((key) => {
        if (mappedData[key] === undefined) {
          delete mappedData[key];
        }
      });

      const suggestLooId = async () => {
        const input = JSON.stringify({
          coords: location,
          created: mappedData.updated_at,
          by: user[process.env.AUTH0_PROFILE_KEY].nickname,
        });
        return hasha(input, { algorithm: 'md5', encoding: 'hex' });
      };

      try {
        // We have a legacy id if it's not a number.
        const isLegacyId = isNaN(id as unknown as number);
        const upsertLoo = await prisma.toilets.upsert({
          where: {
            id: isLegacyId ? -1 : parseInt(id),
            legacy_id: isLegacyId ? id : undefined,
          },
          create: {
            ...mappedData,
            created_at: new Date(),
            legacy_id: (await suggestLooId()).slice(0, 24),
          },
          update: {
            ...mappedData,
          },
        });

        await setLooLocation(prisma, upsertLoo.id, location.lat, location.lng);

        // Update the toilet area relation.
        const result = await decideAndSetLooArea(prisma, upsertLoo.id);

        return {
          code: '200',
          success: true,
          message: 'Report processed',
          report: postgresLooToGraphQL(result),
          loo: postgresLooToGraphQL(result),
        };
      } catch (e) {
        console.log('d', e);
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

  Loo: {},

  DateTime: GraphQLDateTime,

  OpeningTimes: OpeningTimesScalar,
};

export const DateTime = resolvers.DateTime;
export const Mutation = resolvers.Mutation;
export const MutationResponse = resolvers.MutationResponse;
export const OpeningTimes = resolvers.OpeningTimes;
export const Query = resolvers.Query;
