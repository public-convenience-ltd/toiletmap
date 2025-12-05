import { areas, toilets, Prisma } from '@prisma/client';
import { Loo } from '../../@types/resolvers-types';
import { createHash } from 'node:crypto';
import { ReportInput } from '../../@types/resolvers-types';

// Generate an ID for the loo based on the logic used when we wrote toilets to mongodb in the pre-2023 era.
export const suggestLooId = async (
  nickname: string,
  coordinates: number[],
  updatedAt: Date,
): Promise<string> => {
  const input = JSON.stringify({
    coords: coordinates,
    created: updatedAt,
    by: nickname,
  });
  const hashResult = createHash('md5').update(input).digest('hex');
  return hashResult.slice(0, 24);
};

export const postgresLooToGraphQL = (
  loo: toilets & {
    areas?: Partial<areas>;
  },
): Loo => ({
  id: loo.id.toString(),
  geohash: loo.geohash,
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
    // @ts-expect-error -- We know that coordinates are there, but the JsonValue types don't.
    lat: loo.location?.coordinates[1] ?? 0,
    // @ts-expect-error -- We know that coordinates are there, but the JsonValue types don't.
    lng: loo.location?.coordinates[0] ?? 0,
  },
  removalReason: loo.removal_reason,
  radar: loo.radar,
  urinalOnly: loo.urinal_only,
  verifiedAt: loo.verified_at,
  reports: [],
  updatedAt: loo.updated_at,
});

export type ToiletUpsertReport = {
  where: Prisma.toiletsWhereUniqueInput;
  prismaCreate: Prisma.toiletsCreateInput;
  prismaUpdate: Prisma.toiletsUpdateInput;
  extras: {
    location?: {
      lat: number;
      lng: number;
    };
  };
};

type ToiletsExcludingComputed = Omit<
  toilets,
  'id' | 'geohash' | 'area_id' | 'location'
>;

export const postgresUpsertLooQuery = (
  id: string | undefined,
  data: Partial<ToiletsExcludingComputed>,
  location?: { lat: number; lng: number },
): ToiletUpsertReport => {
  return {
    where: { id },
    prismaCreate: {
      ...data,
      id: id,
    },
    prismaUpdate: {
      ...data,
    },
    extras: { location },
  };
};

export const postgresUpsertLooQueryFromReport = async (
  id: string | undefined,
  report: ReportInput,
  nickname: string,
): Promise<ToiletUpsertReport> => {
  const operationTime = new Date();

  let submitId = id;
  if (typeof id === 'undefined') {
    submitId = await suggestLooId(
      nickname,
      [report.location.lng, report.location.lat],
      operationTime,
    );
  }

  const looProperties = {
    accessible: report.accessible,
    active: report.active,
    all_gender: report.allGender,
    attended: report.attended,
    automatic: report.automatic,
    baby_change: report.babyChange,
    children: report.children,
    men: report.men,
    name: report.name,
    no_payment: report.noPayment,
    notes: report.notes,
    opening_times: report.openingTimes ?? undefined,
    payment_details: report.paymentDetails,
    urinal_only: report.urinalOnly,
    radar: report.radar,
    women: report.women,
  };

  return {
    where: {
      id: submitId,
    },
    prismaCreate: {
      ...looProperties,
      // Only try to set the id if the provided id is undefined (this happens when creating a new loo).
      id: submitId,
      created_at: operationTime,
      updated_at: operationTime,
      contributors: {
        set: [nickname],
      },
    },
    prismaUpdate: {
      ...looProperties,
      updated_at: operationTime,
      contributors: {
        push: nickname,
      },
    },
    extras: {
      location: report.location,
    },
  };
};
