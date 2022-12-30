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
            area_id: next?.area_id ?? current.area_id,
          };
          reportsWithSystemUpdatesSquashed.push(coalescedRecord);
        } else {
          reportsWithSystemUpdatesSquashed.push(current);
        }
      }

      const uniqueAreaIds = uniq(
        reportsWithSystemUpdatesSquashed
          .map((report) => report?.area_id)
          .filter((areaId) => areaId !== null || areaId !== undefined)
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

      const postgresAuditRecordToGraphQLReport = (
        index: number,
        record: toilets
      ): Report => {
        return {
          createdAt: index === 0 ? record.created_at : record.updated_at,
          accessible: record.accessible,
          babyChange: record.baby_change,
          active: record.active,
          children: record.children,
          men: record.men,
          paymentDetails: record.payment_details,
          verifiedAt: record.verified_at,
          women: record.women,
          allGender: record.all_gender,
          radar: record.radar,
          openingTimes: record.opening_times,
          noPayment: record.no_payment,
          urinalOnly: record.urinal_only,
          name: record.name,
          removalReason: record.removal_reason,
          area: [areaInfoLookup?.[record?.area_id]],
          attended: record.attended,
          notes: record.notes,
          automatic: record.automatic,
          contributor: record.contributors[record.contributors.length - 1],
          id: record.id,
          location: {
            lat: record.location?.coordinates[1] ?? undefined,
            lng: record.location?.coordinates[0] ?? undefined,
          },
        };
      };

      // Filter out records with a `type` property. These are not loo records, they are areas.
      const f = reportsWithSystemUpdatesSquashed.map((r, i) =>
        postgresAuditRecordToGraphQLReport(i, r)
      );

      return f;
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
  OpeningTimes: OpeningTimesScalar,
};

export const DateTime = resolvers.DateTime;
export const Mutation = resolvers.Mutation;
export const OpeningTimes = resolvers.OpeningTimes;
export const Query = resolvers.Query;
