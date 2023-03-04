import { stringifyAndCompressLoos } from '../../lib/loo';
import {
  Resolvers,
  AreaToiletCount,
  Report,
} from '../../@types/resolvers-types';
import { GraphQLDateTime } from 'graphql-iso-date';
import OpeningTimesScalar from './OpeningTimesScalar';
import uniq from 'lodash/uniq';

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

import _ from 'lodash';

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
      const auditRecords = await prisma.record_version.findMany({
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

      // TODO: Diff the records to get the changes.
      // Right now this is just returning the latest version of the record, not the changes.
      const reportsWithSystemUpdatesSquashed = [];
      for (const recordIndex in auditRecords) {
        const current = auditRecords?.[recordIndex]?.record;

        const nextRecordIndex = parseInt(recordIndex, 10) + 1;
        const next = auditRecords?.[nextRecordIndex]?.record;

        const currentIsSystemUpdate =
          current?.contributors[current.contributors.length - 1].indexOf(
            '-location'
          ) !== -1;

        // We don't want to add system updates to the list of reports.
        // Instead we want to merge them into the report that they are associated with.
        if (currentIsSystemUpdate) {
          continue;
        }

        const nextIsSystemUpdate =
          next?.contributors[next.contributors.length - 1].indexOf(
            '-location'
          ) !== -1;

        // Merge the system update into the report, otherwise just add the report.
        if (nextIsSystemUpdate) {
          const coalescedRecord = {
            ...current,
            location: next?.location ?? current.location,
            geohash: next?.geohash ?? current.geohash,
            geography: next?.geography ?? current.geography,
            area_id: next?.area_id ?? current.area_id,
          };
          reportsWithSystemUpdatesSquashed.push(coalescedRecord);
        } else {
          reportsWithSystemUpdatesSquashed.push(current);
        }
      }

      const diffs = [];
      for (const reportId in reportsWithSystemUpdatesSquashed) {
        const reportIndex = parseInt(reportId, 10);
        const current = reportsWithSystemUpdatesSquashed[reportIndex];

        if (reportIndex === 0) {
          diffs.push(current);
          continue;
        }

        const prev = reportsWithSystemUpdatesSquashed[reportIndex - 1];

        // Get difference between current and next objects
        const diff = Object.keys(prev).reduce((acc, key) => {
          if (!_.isEqual(prev[key], current[key])) {
            acc[key] = current[key];
          }
          return acc;
        }, {});

        diffs.push(diff);
      }

      const uniqueAreaIds = uniq(
        reportsWithSystemUpdatesSquashed
          .map((report) => report?.area_id)
          .filter((areaId) => areaId !== null && areaId !== undefined)
      );

      const areaInfo = await prisma.areas.findMany({
        where: {
          id: {
            in: uniqueAreaIds,
          },
        },
        select: {
          name: true,
          id: true,
          type: true,
        },
      });

      const areaInfoLookup = {};
      for (const area of areaInfo) {
        areaInfoLookup[area.id] = { name: area.name, type: area.type };
      }

      const postgresAuditRecordToGraphQLReport = (diff: toilets): Report => {
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
          area: areaInfoLookup ? [areaInfoLookup?.[diff?.area_id]] : undefined,
          attended: diff.attended,
          notes: diff.notes,
          automatic: diff.automatic,
          contributor: 'Anonymous',
          // contributor: diff.contributors
          //   ? diff.contributors[diff.contributors.length - 1]
          //   : 'Unknown',
          id: diff.id,
          location: diff.location?.coordinates
            ? {
                lat: diff.location?.coordinates[1],
                lng: diff.location?.coordinates[0],
              }
            : undefined,
        };
      };

      const filtered = diffs.map(postgresAuditRecordToGraphQLReport);

      // Order by report creation time.
      filtered.sort((b, a) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      return filtered;
    },
  },
  Mutation: {
    submitReport: async (_parent, args, { prisma, user }) => {
      try {
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
