import { Prisma, PrismaClient, toilets, areas } from '@prisma/client';
import { RemovalReportInput } from '../../@types/resolvers-types';
import { ToiletUpsertReport } from '../graphql/helpers';

export const getLooById = async (
  prisma: PrismaClient,
  id: string,
): Promise<toilets & { areas: Pick<areas, 'name' | 'type'> }> => {
  const res = await prisma.toilets.findUnique({
    where: { id },
    include: { areas: { select: { name: true, type: true } } },
  });
  return res;
};

export const getLooNamesByIds = async (
  prisma: PrismaClient,
  idList: string[],
) => {
  return prisma.toilets.findMany({
    where: {
      id: {
        in: idList,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const setLooLocation = async (
  prisma: PrismaClient,
  id: string,
  lat: number,
  lng: number,
) => {
  return prisma.$executeRaw`
      UPDATE toilets SET
      geography = ST_GeomFromGeoJSON(${JSON.stringify({
    type: 'Point',
    coordinates: [lng, lat],
  })}),
      contributors = array_append(contributors, concat(contributors[array_upper(contributors, 1)], '-location'))
      WHERE id = ${id}
  `;
};

export const getLoosWithinGeohash = async (
  prisma: PrismaClient,
  geohash: string,
  active = true,
) =>
  prisma.toilets.findMany({
    where: {
      geohash: {
        startsWith: geohash,
      },
      AND: [
        {
          active: {
            equals: active,
          },
        },
      ],
    },
  });

export const getAreas = async (prisma: PrismaClient) =>
  prisma.areas.findMany({
    select: {
      name: true,
      type: true,
    },
  });

export const upsertLoo = async (
  prisma: PrismaClient,
  report: ToiletUpsertReport,
  returnFinal = true,
) => {
  try {
    const result = await prisma.toilets.upsert({
      where: report.where,
      create: report.prismaCreate,
      update: report.prismaUpdate,
    });

    if (report.extras.location) {
      // We update the loos' location. This is a separate query because Prisma lacks PostGIS support.
      // Work is underway: https://github.com/prisma/prisma/issues/1798#issuecomment-1319784123
      await setLooLocation(
        prisma,
        result.id,
        report.extras.location.lat,
        report.extras.location.lng,
      );
    }

    if (returnFinal) {
      return getLooById(prisma, result.id);
    }

    return result;
  } catch (e) {
    throw e;
  }
};

export const removeLoo = async (
  prisma: PrismaClient,
  report: RemovalReportInput,
  nickname: string,
) => {
  const { edit: id, reason } = report;
  return prisma.toilets.update({
    where: { id },
    data: {
      active: false,
      removal_reason: reason,
      updated_at: new Date(),
      contributors: {
        push: nickname,
      },
    },
  });
};

export const verifyLoo = async (prisma: PrismaClient, id: string) => {
  return prisma.toilets.update({
    where: { id },
    data: {
      verified_at: new Date(),
      contributors: {
        push: 'GBPTM Contributor',
      },
    },
  });
};

export const upsertArea = async (
  prisma: PrismaClient,
  area: {
    id: string;
    geometry: {
      coordinates: Prisma.JsonValue;
      type: string;
    };
    name: string;
    datasetId: number;
    priority: number;
    type: string;
    version: number;
  },
) => {
  const areaResult = await prisma.areas.upsert({
    where: { id: area.id },
    create: {
      id: area.id,
      name: area.name,
      dataset_id: area.datasetId,
      priority: area.priority,
      type: area.type,
      version: area.version,
    },
    update: {
      id: area.id,
      name: area.name,
      dataset_id: area.datasetId,
      priority: area.priority,
      type: area.type,
      version: area.version,
    },
  });

  await prisma.$executeRaw`
    UPDATE areas SET
      geometry = ST_GeomFromGeoJSON(${JSON.stringify(area.geometry)})
    WHERE id = ${area.id}
  `;

  return areaResult;
};

export const getLoosByProximity = async (
  prisma: PrismaClient,
  lat: number,
  lng: number,
  radius = 1000,
) => {
  const nearbyLoos = (await prisma.$queryRaw`
        SELECT
          loo.id, loo.name, loo.active, loo.men, loo.women, loo.no_payment, loo.notes, loo.opening_times,
          loo.payment_details, loo.accessible, loo.all_gender, loo.attended, loo.automatic, loo.location,
          loo.baby_change, loo.children, loo.created_at, loo.removal_reason, loo.radar, loo.urinal_only,
          loo.verified_at, loo.updated_at, loo.geohash,
          st_distancesphere(
            loo.geography::geometry,
            ST_MakePoint(${lng}, ${lat})
          ) as distance,
          area.name as area_name,
          area.type as area_type
        FROM toilets loo
        INNER JOIN areas area ON area.id = loo.area_id
        WHERE st_distancesphere(
            loo.geography::geometry,
            ST_MakePoint(${lng}, ${lat})
        ) <= ${radius}
      `) as (toilets & {
    distance: number;
    area_name?: string;
    area_type?: string;
  })[];

  // Include areas in the response
  return (
    nearbyLoos?.map((loo) => {
      const hasArea = loo?.area_name && loo?.area_type;

      return {
        ...loo,
        areas: hasArea
          ? { name: loo?.area_name, type: loo?.area_type }
          : undefined,
      };
    }) ?? []
  );
};
