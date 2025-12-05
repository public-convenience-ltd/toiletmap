import {
  stringifyAndCompressFullLoos,
  stringifyAndCompressLoos,
} from '../../lib/loo';
import {
  Resolvers,
  AreaToiletCount,
  Report,
} from '../../@types/resolvers-types';
import { GraphQLDateTime } from './DateTimeScalar';
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
import { toilets } from '@prisma/client';
// Type for JWT-authenticated user from Auth0
interface JWTUser {
  sub?: string;
  [key: string]: unknown;
}

const fetchGraphQLLoosWithinGeohash = async (
  prisma: Context['prisma'],
  geohash: string,
  active?: boolean | null,
) =>
  (
    await getLoosWithinGeohash(prisma, geohash, active)
  )
    .map(postgresLooToGraphQL)
    .flat();

const resolvers: Resolvers<Context> = {
  Query: {
    loo: async (_parent, args, { prisma }) => {
      const loo = await getLooById(prisma, args.id);
      return postgresLooToGraphQL(loo);
    },
    loos: async (_parent, args, { prisma }) => {
      const { filters, pagination, sort } = args;

      if (pagination.limit < 0 || pagination.page < 0) {
        throw new Error('Invalid pagination params');
      }

      if (pagination.limit > 100) {
        throw new Error('Pagination size limit exceeded.');
      }

      const noPaymentFilter =
        typeof filters.noPayment !== 'undefined'
          ? filters?.noPayment
          : undefined;

      let updatedAtFilter = undefined;
      if (filters.fromDate || filters.toDate) {
        updatedAtFilter = {};
      }
      if (filters.fromDate) {
        updatedAtFilter.gte = filters.fromDate;
      }
      if (filters.toDate) {
        updatedAtFilter.lte = filters.toDate;
      }

      const areaFilter = filters?.areaName
        ? { name: { equals: filters.areaName } }
        : undefined;

      const whereQuery = {
        active: filters?.active,
        no_payment: noPaymentFilter,
        updated_at: updatedAtFilter,
        areas: areaFilter,
      };

      const totalToiletCount = await prisma.toilets.count({
        where: {
          ...whereQuery,
          OR: filters?.text
            ? [{ name: { contains: filters.text, mode: 'insensitive' } }]
            : undefined,
        },
      });

      // Paginated toilets findAll query against Prisma.
      const loos = await prisma.toilets.findMany({
        where: {
          ...whereQuery,
          OR: filters?.text
            ? [{ name: { contains: filters.text, mode: 'insensitive' } }]
            : undefined,
        },
        include: {
          areas: true,
        },
        orderBy: {
          updated_at: sort === 'NEWEST_FIRST' ? 'desc' : 'asc',
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      });

      return {
        loos: loos.map(postgresLooToGraphQL),
        limit: pagination.limit,
        pages: Math.ceil(totalToiletCount / pagination.limit),
        page: pagination.page,
        total: totalToiletCount,
      };
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
        args.from.maxDistance,
      );
      return result.map(postgresLooToGraphQL);
    },
    loosByGeohash: async (_parent, args, { prisma }) =>
      stringifyAndCompressLoos(
        await fetchGraphQLLoosWithinGeohash(prisma, args.geohash, args.active),
      ),
    fullLoosByGeohash: async (_parent, args, { prisma }) =>
      stringifyAndCompressFullLoos(
        await fetchGraphQLLoosWithinGeohash(prisma, args.geohash, args.active),
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
          activeToiletsInAreas.map((area) => [area.name, area._count.toilets]),
        );

        const removedAreas = Object.fromEntries(
          removedToiletsInAreas.map((area) => [area.name, area._count.toilets]),
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
    // This collates records from the audit table.
    reportsForLoo: async (_parent, args, { prisma }) => {
      const auditRecords = await prisma.record_version.findMany({
        where: {
          record: {
            path: ['id'],
            equals: args.id,
          },
        },
        select: {
          record: true,
          id: true,
        },
      });

      const postgresAuditRecordToGraphQLReport = (
        reportId: bigint,
        diff: toilets,
      ): Report => {
        const contributor = diff.contributors.pop();

        // TODO: This return is incomplete, we need to support loo, area and contributors (when authenticated only.)
        return {
          createdAt: diff.updated_at,
          accessible: diff.accessible,
          babyChange: diff.baby_change,
          active: diff.active,
          children: diff.children,
          men: diff.men,
          paymentDetails: diff.payment_details,
          verifiedAt: diff.verified_at,
          women: diff.women,
          allGender: diff.all_gender,
          radar: diff.radar,
          openingTimes: diff.opening_times,
          noPayment: diff.no_payment,
          urinalOnly: diff.urinal_only,
          name: diff.name,
          removalReason: diff.removal_reason,
          attended: diff.attended,
          notes: diff.notes,
          automatic: diff.automatic,
          geohash: diff.geohash,
          // TODO: We don't want to return contributor info until we can redact it for non-authenticated users.
          contributor: 'Anonymous',
          id: reportId.toString(),
          isSystemReport: contributor.endsWith('-location'),
          // @ts-expect-error -- We know that coordinates are there, but the JsonValue types don't.
          location: diff.location?.coordinates
            ? {
              // @ts-expect-error -- We know that coordinates are there, but the JsonValue types don't.
              lat: diff.location?.coordinates[1],
              // @ts-expect-error -- We know that coordinates are there, but the JsonValue types don't.
              lng: diff.location?.coordinates[0],
            }
            : undefined,
        };
      };

      const filtered = auditRecords.map((auditEntry) =>
        // TODO: use zod to validate the shape of the record.
        // @ts-expect-error -- We expect this until we use zod to validate the shape of the record.
        postgresAuditRecordToGraphQLReport(auditEntry.id, auditEntry.record),
      );

      // Order by report creation time.
      // We make sure that user reports sit before system reports as they are made at the same time.
      filtered.sort((b, a) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();

        if (aTime === bTime) {
          if (a.isSystemReport) {
            return -1;
          }
          if (b.isSystemReport) {
            return 1;
          }
          return 0;
        }

        return bTime - aTime;
      });

      return filtered;
    },
  },
  Mutation: {
    submitReport: async (_parent, args, { prisma, user }) => {
      try {
        // Convert the submitted report to a format that can be saved to the database.
        const nickname = (user[process.env.AUTH0_PROFILE_KEY as string] as JWTUser)
          ?.nickname as string;
        const postgresLoo = await postgresUpsertLooQueryFromReport(
          args.report.edit,
          args.report,
          nickname,
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
        const nickname = (user[process.env.AUTH0_PROFILE_KEY as string] as JWTUser)
          ?.nickname as string;
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
  // @ts-expect-error -- There's a problem with enum types in the resolvers.
  SortOrder: {
    NEWEST_FIRST: { updatedAt: 'desc' },
    OLDEST_FIRST: { updatedAt: 'asc' },
  },
  OpeningTimes: OpeningTimesScalar,
};

export const DateTime = resolvers.DateTime;
export const Mutation = resolvers.Mutation;
export const OpeningTimes = resolvers.OpeningTimes;
export const Query = resolvers.Query;
