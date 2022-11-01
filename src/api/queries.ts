import { areas, PrismaClient, toilets } from '@prisma/client';
import { Loo } from '../../api-client/graphql';

export const postgresLooToGraphQL = (
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

export const decideAndSetLooArea = async (prisma: PrismaClient, id: number) => {
  // Find the area that the loo belongs to.
  const areaID = await prisma.$queryRaw`
    SELECT a.id from
    toilets inner join areas a on ST_WITHIN(toilets.geography::geometry, a.geometry::geometry)
    WHERE toilets.id = ${id}
  `;

  return prisma.toilets.update({
    where: { id: id },
    data: {
      area_id: areaID[0]?.id,
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

export const getLoosByProximity = async (
  prisma: PrismaClient,
  lat: number,
  lng: number,
  radius: number
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
