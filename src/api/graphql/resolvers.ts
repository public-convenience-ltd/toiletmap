import { stringifyAndCompressLoos } from '../../lib/loo';
import { Resolvers } from '../../@types/resolvers-types';
import { GraphQLDateTime } from 'graphql-iso-date';
import OpeningTimesScalar from './OpeningTimesScalar';

import {
  decideAndSetLooArea,
  getAreas,
  getLooById,
  getLooNamesByIds,
  getLoosByProximity,
  getLoosWithinGeohash,
  setLooLocation,
} from '../prisma/queries';

import { Context } from './context';
import {
  postgresLooToGraphQL,
  reportToPostgresLoo,
  suggestLegacyLooId,
} from './helpers';

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
      stringifyAndCompressLoos(
        (await getLoosWithinGeohash(prisma, args.geohash, args.active))
          .map(postgresLooToGraphQL)
          .flat()
      ),
    areas: async (_parent, args, { prisma }) => getAreas(prisma),
    legacyReportsForLoo: async (_parent, args, { prisma }) => {
      const isLegacyId = isNaN(args.id as unknown as number);
      if (isLegacyId) {
        const reports = (await getLooById(prisma, args.id)).reports;
        return reports;
      }

      const reports = (await getLooById(prisma, parseInt(args.id))).reports;
      return Object.values(reports);
    },
    reportsForLoo: async (_parent, args, { prisma }) => {
      const isLegacyId = isNaN(args.id as unknown as number);
      if (isLegacyId) {
        const reports = await prisma.record_version.findMany({
          where: {
            record: {
              path: ['legacy_id'],
              equals: args.id,
            },
          },
          select: {
            record: true,
          },
        });
        return reports.map((r) => r.record);
      }

      const reports = await prisma.record_version.findMany({
        where: {
          record: {
            path: ['id'],
            equals: parseInt(args.id),
          },
        },
        select: {
          record: true,
        },
      });
      return reports.map((r) => postgresLooToGraphQL(r.record));
    },
  },
  Mutation: {
    submitReport: async (_parent, args, { prisma, user }) => {
      const { edit: id, location } = args.report;

      // Convert the submitted report to a format that can be saved to the database.
      const postgresLoo = reportToPostgresLoo(args.report);

      const nickname = user[process.env.AUTH0_PROFILE_KEY].nickname;
      const legacyId = await suggestLegacyLooId(
        nickname,
        location,
        postgresLoo.updated_at
      );

      try {
        const isLegacyId = isNaN(id as unknown as number);
        const upsertLoo = await prisma.toilets.upsert({
          where: {
            id: isLegacyId ? -1 : parseInt(id),
            legacy_id: isLegacyId ? id : undefined,
          },
          create: {
            ...postgresLoo,
            created_at: new Date(),
            legacy_id: legacyId.slice(0, 24),
            contributors: {
              set: [nickname],
            },
          },
          update: {
            ...postgresLoo,
            contributors: {
              push: nickname,
            },
          },
        });

        await setLooLocation(prisma, upsertLoo.id, location.lat, location.lng);

        // Update the toilet area relation.
        const result = await decideAndSetLooArea(prisma, upsertLoo.id);

        return {
          code: '200',
          success: true,
          message: 'Report processed',
          loo: postgresLooToGraphQL(result),
        };
      } catch (e) {
        return {
          code: '400',
          success: false,
          message: e,
        };
      }
    },
    submitRemovalReport: async (_parent, args, { prisma, user }) => {
      const { edit: id, reason } = args.report;

      const isLegacyId = isNaN(id as unknown as number);
      const result = await prisma.toilets.update({
        where: {
          id: isLegacyId ? -1 : parseInt(id),
          legacy_id: isLegacyId ? id : undefined,
        },
        data: {
          active: false,
          removal_reason: reason,
          updated_at: new Date(),
          contributors: {
            push: user.nickname,
          },
        },
      });

      try {
        return {
          code: '200',
          success: true,
          message: 'Report processed',
          loo: postgresLooToGraphQL(result),
        };
      } catch (e) {
        return {
          code: '400',
          success: false,
          message: e,
        };
      }
    },
    submitVerificationReport: async (_parent, { id }, { prisma }) => {
      const isLegacyId = isNaN(id as unknown as number);
      const result = await prisma.toilets.update({
        where: {
          id: isLegacyId ? -1 : parseInt(id),
          legacy_id: isLegacyId ? id : undefined,
        },
        data: {
          verified_at: new Date(),
        },
      });

      try {
        return {
          code: '200',
          success: true,
          message: 'Toilet data verified',
          loo: postgresLooToGraphQL(result),
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
  DateTime: GraphQLDateTime,
  OpeningTimes: OpeningTimesScalar,
};

export const DateTime = resolvers.DateTime;
export const Mutation = resolvers.Mutation;
export const OpeningTimes = resolvers.OpeningTimes;
export const Query = resolvers.Query;
