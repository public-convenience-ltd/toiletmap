import { PrismaClient } from '@prisma/client';
import {
  newloos,
  areas,
  newreports,
  PrismaClient as PrismaClientMongo,
} from '../generated/schemaMongo';
import { SingleBar } from 'cli-progress';
import { upsertArea, upsertLoo } from '../src/api/prisma/queries';
import { postgresUpsertLooQuery } from '../src/api/graphql/helpers';

(async () => {
  console.log('Connecting to MongoDB...');
  const mongoPrisma = new PrismaClientMongo();
  await mongoPrisma.$connect();
  console.log('Connecting to PostgreSQL...');
  const prisma = new PrismaClient();
  await prisma.$connect();

  console.log('fetching areas from mongo...');
  const allMongoAreas = await mongoPrisma.areas.findMany();
  console.log('upserting areas to postgres...');

  console.log('Fetching loo data from Mongo...');
  const allMongoLoos = await mongoPrisma.newloos.findMany();

  console.log('Fetching report data from Mongo...');
  const allMongoReports = await mongoPrisma.newreports.findMany();

  await upsertAreas(prisma, allMongoAreas);
  await upsertLoos(prisma, allMongoReports, allMongoLoos);
})();

const upsertAreas = async (prisma: PrismaClient, mongoAreas: areas[]) => {
  const bar = new SingleBar({
    stopOnComplete: true,
    etaBuffer: 30,
    barCompleteChar: '✨',
  });

  bar.start(mongoAreas.length, 0);

  let index = 0;

  for (const area of mongoAreas) {
    await upsertArea(prisma, { ...area, legacyId: area.id });
    bar.update(index++);
  }

  bar.stop();

  console.log('Done upserting areas.');
};

const upsertLoos = async (
  prisma: PrismaClient,
  mongoReports: newreports[],
  mongoLoos: newloos[]
) => {
  const mappedMongoReports = {};
  for (const report of mongoReports) {
    mappedMongoReports[report.id] = report;
  }

  console.log('Beginning upsert of loos...');

  const bar = new SingleBar({
    stopOnComplete: true,
    etaBuffer: 30,
    barCompleteChar: '✨',
  });

  bar.start(mongoLoos.length, 0);

  let index = 0;

  for (const loo of mongoLoos) {
    const { properties } = loo;
    const resolvedReports = {};
    for (const report of loo.reports) {
      resolvedReports[report] = mappedMongoReports[report];
    }

    const query = postgresUpsertLooQuery(
      loo.id,
      {
        accessible: properties.accessible,
        baby_change: properties.babyChange,
        active: properties.active,
        all_gender: properties.allGender,
        attended: properties.attended,
        automatic: properties.automatic,
        children: properties.children,
        created_at: loo.createdAt,
        verified_at: properties.verifiedAt,
        updated_at: loo.updatedAt,
        name: properties.name,
        removal_reason: properties.removalReason,
        legacy_id: loo.id,
        reports: resolvedReports,
        contributors: loo.contributors,
        women: properties.women,
        men: properties.men,
        no_payment: properties.noPayment,
        notes: properties.notes,
        opening_times: properties.openingTimes ?? [[], [], [], [], [], [], []],
        payment_details: properties.paymentDetails,
        radar: properties.radar,
        urinal_only: properties.urinalOnly,
      },
      {
        lat: properties.geometry.coordinates[1],
        lng: properties.geometry.coordinates[0],
      }
    );

    await upsertLoo(prisma, query);

    bar.update(index++);
  }

  bar.stop();

  console.log('Done.');
};

// const checkDataIntegrity = async (prisma: PrismaClient) => {
//   return undefined;
// };
