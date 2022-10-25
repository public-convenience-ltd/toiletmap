import { PrismaClient, toilets } from '@prisma/client';
import { PrismaClient as PrismaClientMongo } from '../generated/schemaMongo';
import { SingleBar } from 'cli-progress';

(async () => {
  console.log('Connecting to MongoDB...');
  const mongoPrisma = new PrismaClientMongo();
  await mongoPrisma.$connect();
  console.log('Connecting to PostgreSQL...');
  const psqlPrisma = new PrismaClient();
  await psqlPrisma.$connect();

  const upsertAreas = async () => {
    console.log('fetching areas from mongo...');
    const allMongoAreas = await mongoPrisma.areas.findMany();
    console.log('upserting areas to postgres...');

    const bar = new SingleBar({
      stopOnComplete: true,
      etaBuffer: 30,
      barCompleteChar: '✨',
    });

    bar.start(allMongoAreas.length, 0);

    let index = 0;

    for (const area of allMongoAreas) {
      await psqlPrisma.areas.upsert({
        where: { legacy_id: area.id },
        create: {
          legacy_id: area.id,
          name: area.name,
          dataset_id: area.datasetId,
          priority: area.priority,
          type: area.type,
          version: area.version,
        },
        update: {
          legacy_id: area.id,
          name: area.name,
          dataset_id: area.datasetId,
          priority: area.priority,
          type: area.type,
          version: area.version,
        },
      });

      await psqlPrisma.$executeRaw`
        UPDATE areas SET
          geometry = ST_GeomFromGeoJSON(${JSON.stringify(area.geometry)})
        WHERE legacy_id = ${area.id}
    `;

      bar.update(index++);
    }

    bar.stop();

    console.log('Done upserting areas.');
  };

  const upsertLoos = async () => {
    console.log('Fetching loo data from Mongo...');
    const allMongoLoos = await mongoPrisma.newloos.findMany();
    console.log('Fetching report data from Mongo...');
    const allMongoReports = await mongoPrisma.newreports.findMany();
    const mappedMongoReports = {};
    for (const report of allMongoReports) {
      mappedMongoReports[report.id] = report;
    }

    console.log('Beginning upsert of loos...');

    const bar = new SingleBar({
      stopOnComplete: true,
      etaBuffer: 30,
      barCompleteChar: '✨',
    });

    bar.start(allMongoLoos.length, 0);

    let index = 0;

    for (const loo of allMongoLoos) {
      const resolvedReports = {};
      for (const report of loo.reports) {
        resolvedReports[report] = mappedMongoReports[report];
      }

      const mappedData = {
        accessible: loo.properties.accessible,
        active: loo.properties.active,
        attended: loo.properties.attended,
        automatic: loo.properties.automatic,
        babyChange: loo.properties.babyChange,
        men: loo.properties.men,
        noPayment: loo.properties.noPayment,
        notes: loo.properties.notes,
        paymentDetails: loo.properties.paymentDetails,
        radar: loo.properties.radar,
        removalReason: loo.properties.removalReason,
        women: loo.properties.women,
        created_at: loo.createdAt,
        updated_at: loo.updatedAt,
        contributors: loo.contributors,
        urinalOnly: loo.properties.urinalOnly,
        allGender: loo.properties.allGender,
        children: loo.properties.children,
        openingTimes: loo.properties.openingTimes ?? undefined,
        verifiedAt: loo.properties.verifiedAt,
        reports: resolvedReports,
        name: loo.properties.name,
      } as toilets;

      const upsertLoo = psqlPrisma.toilets.upsert({
        where: { legacy_id: loo.id },
        create: {
          legacy_id: loo.id,
          ...mappedData,
        },
        update: {
          ...mappedData,
        },
      });

      await upsertLoo;

      await psqlPrisma.$executeRaw`
          UPDATE toilets SET
          geometry = ST_GeomFromGeoJSON(${JSON.stringify(
            loo.properties.geometry
          )})
          WHERE legacy_id = ${loo.id}
      `;

      // const areaID = await psqlPrisma.$queryRaw`
      //   SELECT a.id from
      //   toilets inner join areas a on ST_WITHIN(toilets.geometry::geometry, a.geometry::geometry)
      //   WHERE toilets.legacy_id = ${loo.id}
      // `;

      // await psqlPrisma.toilets.update({
      //   where: { legacy_id: loo.id },
      //   data: {
      //     area_id: areaID[0]?.id,
      //   },
      // });

      bar.update(index++);
    }

    bar.stop();

    console.log('Done.');

    // TODO: Check for data integrity
  };

  await upsertAreas();

  await upsertLoos();
})();
