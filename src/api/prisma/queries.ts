import { PrismaClient, toilets } from '@prisma/client';

export const getLooById = async (
  prisma: PrismaClient,
  id: string | number
): Promise<toilets> => {
  const isLegacyId = typeof id === 'string';

  if (isLegacyId) {
    return await prisma.toilets.findUnique({
      include: { areas: { select: { name: true, type: true } } },
      where: { legacy_id: id },
    });
  }

  return await prisma.toilets.findUnique({
    include: { areas: { select: { name: true, type: true } } },
    where: { id },
  });
};

export const getLooNamesByIds = async (
  prisma: PrismaClient,
  idList: string[]
) => {
  const loos = await prisma.toilets.findMany({
    where: {
      legacy_id: {
        in: idList,
      },
    },
    select: {
      legacy_id: true,
      name: true,
    },
  });
  return loos.map((loo) => ({ id: loo.legacy_id, name: loo.name }));
};

export const getLoosByProximity = async (
  prisma: PrismaClient,
  lat: number,
  lng: number,
  radius: number
) => {
  const nearbyLoos = (await prisma.$queryRaw`
        SELECT
          loo.legacy_id, loo.name, active, men, women, no_payment, notes, opening_times, payment_details,
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
          ) <= ${radius ?? 1000}
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
