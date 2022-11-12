import { Prisma, PrismaClient, toilets } from '@prisma/client';

export const getLooById = async (
  prisma: PrismaClient,
  id: string | number
): Promise<toilets> => {
  const isLegacyId = typeof id === 'string';

  if (isLegacyId) {
    return prisma.toilets.findUnique({
      include: { areas: { select: { name: true, type: true } } },
      where: { legacy_id: id },
    });
  }

  return prisma.toilets.findUnique({
    include: { areas: { select: { name: true, type: true } } },
    where: { id },
  });
};

export const getLooNamesByIds = async (
  prisma: PrismaClient,
  idList: string[]
) => {
  return prisma.toilets.findMany({
    where: {
      id: {
        in: idList.map((id) => parseInt(id)),
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
  id: number,
  lat: number,
  lng: number
) => {
  return prisma.$executeRaw`
      UPDATE toilets SET
      geography = ST_GeomFromGeoJSON(${JSON.stringify({
        type: 'Point',
        coordinates: [lng, lat],
      })})
      WHERE id = ${id}
  `;
};

export const getLoosWithinGeohash = async (
  prisma: PrismaClient,
  geohash: string,
  active = true
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

export const upsertArea = async (
  prisma: PrismaClient,
  area: {
    legacyId: string;
    geometry: {
      coordinates: Prisma.JsonValue;
      type: string;
    };
    name: string;
    datasetId: number;
    priority: number;
    type: string;
    version: number;
  }
) => {
  const areaResult = await prisma.areas.upsert({
    where: { legacy_id: area.legacyId },
    create: {
      legacy_id: area.legacyId,
      name: area.name,
      dataset_id: area.datasetId,
      priority: area.priority,
      type: area.type,
      version: area.version,
    },
    update: {
      legacy_id: area.legacyId,
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
    WHERE legacy_id = ${area.legacyId}
  `;

  return areaResult;
};

export const getLoosByProximity = async (
  prisma: PrismaClient,
  lat: number,
  lng: number,
  radius = 1000
) => {
  const nearbyLoos = (await prisma.$queryRaw`
        SELECT
          loo.id, loo.legacy_id, loo.name, active, men, women, no_payment, notes, opening_times, payment_details,
          accessible, active, all_gender, attended, automatic, location, baby_change, children, created_at,
          removal_reason, radar, urinal_only, verified_at,updated_at,
          st_distancesphere(
            geography::geometry,
            ST_MakePoint(${lng}, ${lat})
          ) as distance,
          area.name as area_name,
          area.type as area_type from toilets loo inner join areas area on area.id = loo.area_id
          where st_distancesphere(
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
