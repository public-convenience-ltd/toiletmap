import { stringifyAndCompressLoos } from '../../lib/loo';
import { Resolvers, AreaToiletCount } from '../../@types/resolvers-types';
import { GraphQLDateTime } from 'graphql-iso-date';
import OpeningTimesScalar from './OpeningTimesScalar';

import {
  getAreas,
  getLooById,
  getLooNamesByIds,
  getLoosByProximity,
  getLoosWithinGeohash,
  removeLoo,
  upsertLoo,
  verifyLoo,
} from '../prisma/queries';

import { Context } from './context';
import {
  postgresLooToGraphQL,
  postgresUpsertLooQueryFromReport,
} from './helpers';

const resolvers: Resolvers<Context> = {
  Query: {
    loo: async (_parent, args, { prisma }) => {
      const loo = await getLooById(prisma, args.id);
      return postgresLooToGraphQL(loo);
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
    statistics: async (_parent, _args, { prisma }) => {
      const activeCountQuery = prisma.toilets.count({
        where: { active: true },
      });
      const removedCountQuery = prisma.toilets.count({
        where: { active: false },
      });
      const totalCountQuery = prisma.toilets.count();

      const activeToiletsInAreasQuery = prisma.areas.findMany({
        include: {
          _count: {
            select: {
              toilets: {
                where: { active: true },
              },
            },
          },
        },
      });

      const removedToiletsInAreasQuery = prisma.areas.findMany({
        include: {
          _count: {
            select: {
              toilets: {
                where: { active: false },
              },
            },
          },
        },
      });

      try {
        const [
          activeToiletsCount,
          removedToiletsCount,
          totalToiletsCount,
          activeToiletsInAreas,
          removedToiletsInAreas,
        ] = await prisma.$transaction([
          activeCountQuery,
          removedCountQuery,
          totalCountQuery,
          activeToiletsInAreasQuery,
          removedToiletsInAreasQuery,
        ]);

        const activeAreas = Object.fromEntries(
          activeToiletsInAreas.map((area) => [area.name, area._count.toilets])
        );

        const removedAreas = Object.fromEntries(
          removedToiletsInAreas.map((area) => [area.name, area._count.toilets])
        );

        const areaToiletCount: AreaToiletCount[] = [];

        for (const name in activeAreas) {
          const activeCount = activeAreas[name] ?? 0;
          const removedCount = removedAreas[name] ?? 0;

          areaToiletCount.push({
            name,
            active: activeCount,
            removed: removedCount,
          });
        }

        return {
          total: totalToiletsCount,
          active: activeToiletsCount,
          removed: removedToiletsCount,
          areaToiletCount,
        };
      } catch (e) {
        console.log(e);

        return {};
      }
    },
    // This collates records from the audit table and compiles them into reports.
    reportsForLoo: async (_parent, args, { prisma }) => {
      const reports = await prisma.record_version.findMany({
        where: {
          record: {
            path: ['id'],
            equals: args.id,
          },
        },
        select: {
          record: true,
        },
      });

      // Filter out records with a `type` property. These are not loo records, they are areas.
      return reports
        .filter((r) => r.record?.type == undefined)
        .map((r) => postgresLooToGraphQL(r.record));
    },
  },
  Mutation: {
    submitReport: async (_parent, args, { prisma, user }) => {
      try {
        // args.report.accessible = args.report.accessible || false;
        // Convert the submitted report to a format that can be saved to the database.

        const nickname = user[process.env.AUTH0_PROFILE_KEY]?.nickname;
        const postgresLoo = await postgresUpsertLooQueryFromReport(
          args.report.edit,
          args.report,
          nickname
        );

        const result = await upsertLoo(prisma, postgresLoo);

        return {
          code: '200',
          success: true,
          message: 'Report processed',
          loo: postgresLooToGraphQL(result),
        };
      } catch (e) {
        console.log('update err', e);
        return {
          code: '400',
          success: false,
          message: e,
        };
      }
    },
    submitRemovalReport: async (_parent, args, { prisma, user }) => {
      try {
        const nickname = user[process.env.AUTH0_PROFILE_KEY].nickname;
        const result = await removeLoo(prisma, args.report, nickname);

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
      try {
        const result = await verifyLoo(prisma, id);
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
