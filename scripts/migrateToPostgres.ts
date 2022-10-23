import { PrismaClient } from '../generated/prisma-client-js';
import { PrismaClient as PrismaClientMongo } from '../generated/schemaMongo';

(async () => {
  const mongoPrisma = new PrismaClientMongo();
  mongoPrisma.$connect();
  const allMongoLoos = await mongoPrisma.newloos.findMany();

  const psqlPrisma = new PrismaClient();
  psqlPrisma.$connect();

  for (const loo of allMongoLoos) {
    const {
      accessible,
      active,
      // area,
      attended,
      automatic,
      babyChange,
      men,
      noPayment,
      notes,
      openingTimes,
      paymentDetails,
      radar,
      removalReason,
      urinalOnly,
      allGender,
      children,
      women,
      name,
      // verifiedAt
    } = loo.properties;

    const resolvedReports = await mongoPrisma.newreports.findMany({
      where: { id: { in: loo.reports } },
    });

    const upsertLoo = psqlPrisma.toilets.upsert({
      where: { legacy_id: loo.id },
      create: {
        name,
        legacy_id: loo.id,
        accessible,
        active,
        attended,
        automatic,
        babyChange,
        men,
        noPayment,
        notes,
        paymentDetails,
        radar,
        removalReason,
        women,
        created_at: loo.createdAt,
        updated_at: loo.updatedAt,
        contributors: loo.contributors,
        urinalOnly,
        allGender,
        children,
        openingTimes: (openingTimes ?? undefined)?.flat(),
        reports: resolvedReports,
      },
      update: {
        accessible,
        active,
        attended,
        automatic,
        babyChange,
        men,
        noPayment,
        notes,
        paymentDetails,
        radar,
        removalReason,
        women,
        created_at: loo.createdAt,
        updated_at: loo.updatedAt,
        contributors: loo.contributors,
        urinalOnly,
        allGender,
        children,
        openingTimes: (openingTimes ?? undefined)?.flat(),
        reports: resolvedReports,
      },
    });

    const geometry = loo.properties.geometry;
    const updateLooGeometry = psqlPrisma.$executeRaw`
      UPDATE toilets SET
      geometry = ST_SetSRID(ST_MakePoint(${geometry.coordinates[0]}, ${geometry.coordinates[1]}), 4326)
      WHERE legacy_id = ${loo.id}
    `;

    const result = await upsertLoo;
    const updateGeometry = await updateLooGeometry;

    console.log(result, updateGeometry);
  }
})();
