import { PrismaClient } from '@prisma/client';
import {
  newloos,
  areas,
  newreports,
  PrismaClient as PrismaClientMongo,
} from '../generated/schemaMongo';
import { SingleBar } from 'cli-progress';
import { upsertArea, upsertLoo } from '../src/api/prisma/queries';

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
    const resolvedReports = {};
    for (const report of loo.reports) {
      resolvedReports[report] = mappedMongoReports[report];
    }
    9;
    const { properties, ...rest } = loo;

    await upsertLoo(
      prisma,
      {
        ...properties,
        location: {
          lat: properties.geometry.coordinates[1],
          lng: properties.geometry.coordinates[0],
        },
        ...rest,
      },
      undefined,
      resolvedReports,
      loo.contributors
    );

    bar.update(index++);
  }

  bar.stop();

  console.log('Done.');
};

// const checkDataIntegrity = async (prisma: PrismaClient) => {
//   return undefined;
// };
