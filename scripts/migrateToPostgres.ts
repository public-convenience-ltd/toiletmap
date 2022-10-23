import { PrismaClient } from '../generated/prisma-client-js';
import { PrismaClient as PrismaClientMongo } from '../generated/schemaMongo';
import { SingleBar } from 'cli-progress';

(async () => {
  const mongoPrisma = new PrismaClientMongo();
  mongoPrisma.$connect();

  // const allMongoAreas = await mongoPrisma.areas.findMany();

  const upsertLoos = async () => {
    console.log('Fetching data from Mongo...');
    const allMongoLoos = await mongoPrisma.newloos.findMany();
    const allMongoReports = await mongoPrisma.newreports.findMany();
    const mappedMongoReports = {};
    for (const report of allMongoReports) {
      mappedMongoReports[report.id] = report;
    }

    const psqlPrisma = new PrismaClient();
    psqlPrisma.$connect();

    console.log('Upserting loos...');

    const bar = new SingleBar({
      stopOnComplete: true,
      etaBuffer: 30,
      barCompleteChar: '✨',
    });

    bar.start(allMongoLoos.length, 0);

    let index = 0;

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
        verifiedAt,
      } = loo.properties;

      const resolvedReports = {};
      for (const report of loo.reports) {
        resolvedReports[report] = mappedMongoReports[report];
      }

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
          verifiedAt,
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
          verifiedAt,
        },
      });

      const result = await upsertLoo;
      if (!result.geohash) {
        const geometry = loo.properties.geometry;
        const updateLooGeometry = psqlPrisma.$executeRaw`
        UPDATE toilets SET
        geometry = ST_SetSRID(ST_MakePoint(${geometry.coordinates[0]}, ${geometry.coordinates[1]}), 4326)
        WHERE legacy_id = ${loo.id}
      `;

        await updateLooGeometry;
      }

      bar.update(index++);
    }

    bar.stop();

    console.log('Done.');
  };

  await upsertLoos();
})();
