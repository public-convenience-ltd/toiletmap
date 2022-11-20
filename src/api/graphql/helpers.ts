import { areas, toilets, Prisma } from '@prisma/client';
import { Loo, PointInput } from '../../api-client/graphql';
import { async as hasha } from 'hasha';
import { ReportInput } from '../../@types/resolvers-types';

export const isLegacyId = (id: string): boolean =>
  isNaN(id as unknown as number);

export const selectLegacyOrModernLoo = (
  id?: string | number
): Prisma.toiletsWhereUniqueInput => {
  if (typeof id === 'undefined') {
    return {
      id: -1,
      legacy_id: undefined,
    };
  }

  if (typeof id === 'string') {
    const isModernId = !isLegacyId(id);

    // The id is a valid number in string form, we can assume it's modern.
    if (isModernId) {
      return {
        id: parseInt(id, 10),
      };
    }

    // The id can't be casted to a number, we assume it's legacy.
    return {
      legacy_id: id,
    };
  }

  // The id is a number, it's modern.
  return {
    id,
  };
};

// Generate a legacy ID for the loo based on the logic used when writing to mongodb.
export const suggestLegacyLooId = async (
  nickname: string,
  location: PointInput,
  updatedAt: Date
): Promise<string> => {
  const input = JSON.stringify({
    coords: location,
    created: updatedAt,
    by: nickname,
  });
  const hashResult = await hasha(input, { algorithm: 'md5', encoding: 'hex' });
  return hashResult.slice(0, 24);
};

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

export type ToiletUpsertReport = {
  where: Prisma.toiletsWhereUniqueInput;
  prismaCreate: Prisma.toiletsCreateInput;
  prismaUpdate: Prisma.toiletsUpdateInput;
  extras: {
    location: {
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
  id: string | number,
  data: ToiletsExcludingComputed,
  location: { lat: number; lng: number }
): ToiletUpsertReport => {
  const operationTime = new Date();
  return {
    where: selectLegacyOrModernLoo(id),
    prismaCreate: {
      ...data,
    },
    prismaUpdate: {
      ...data,
      updated_at: operationTime,
    },
    extras: { location },
  };
};

export const postgresUpsertLooQueryFromReport = async (
  id: string | number,
  report: ReportInput,
  nickname: string
): Promise<ToiletUpsertReport> => {
  const operationTime = new Date();

  const legacyId = await suggestLegacyLooId(
    nickname,
    report.location,
    operationTime
  );

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
    opening_times: report.openingTimes ?? [],
    payment_details: report.paymentDetails,
    urinal_only: report.urinalOnly,
    radar: report.radar,
    women: report.women,
  };

  return {
    where: selectLegacyOrModernLoo(id),
    prismaCreate: {
      ...looProperties,
      legacy_id: legacyId,
      created_at: operationTime,
      updated_at: operationTime,
      verified_at: operationTime,
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
