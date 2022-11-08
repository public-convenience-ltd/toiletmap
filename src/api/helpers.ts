import { areas, toilets } from '@prisma/client';
import { Loo, PointInput } from '../api-client/graphql';
import { async as hasha } from 'hasha';

// Generate a legacy ID for the loo based on the logic used when writing to mongodb.
export const suggestLegacyLooId = async (
  nickname: string,
  location: PointInput,
  updatedAt: Date
) => {
  const input = JSON.stringify({
    coords: location,
    created: updatedAt,
    by: nickname,
  });
  return hasha(input, { algorithm: 'md5', encoding: 'hex' });
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

export const reportToPostgresLoo = (report: Loo): Partial<toilets> => {
  const mappedData = {
    accessible: report.accessible,
    active: true,
    attended: report.attended,
    automatic: report.automatic,
    baby_change: report.babyChange,
    men: report.men,
    no_payment: report.noPayment,
    notes: report.notes,
    payment_details: report.paymentDetails,
    radar: report.radar,
    women: report.women,
    updated_at: new Date(),
    urinal_only: report.urinalOnly,
    all_gender: report.allGender,
    children: report.children,
    opening_times: report.openingTimes ?? undefined,
    verified_at: new Date(),
    name: report.name,
  };

  // Remove undefined values.
  Object.keys(mappedData).forEach((key) => {
    if (mappedData[key] === undefined) {
      delete mappedData[key];
    }
  });

  return mappedData;
};
