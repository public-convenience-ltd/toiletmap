import { PrismaClient } from '@prisma/client';
import {
  newloos,
  areas,
  newreports,
  PrismaClient as PrismaClientMongo,
  NewloosProperties,
} from '../generated/schemaMongo';
import { SingleBar } from 'cli-progress';
import { getLooById, upsertArea, upsertLoo } from '../src/api/prisma/queries';
import { postgresUpsertLooQuery } from '../src/api/graphql/helpers';
import { expect } from 'chai';

type MongoReportMap = { [reportId: string]: newreports };

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
  const allMongoLoos = await mongoPrisma.newloos.findMany({ take: 1000 });

  console.log('Fetching report data from Mongo...');
  const allMongoReports = await mongoPrisma.newreports.findMany();

  const mappedMongoReports: MongoReportMap = {};
  for (const report of allMongoReports) {
    mappedMongoReports[report.id] = report;
  }

  await upsertAreas(prisma, allMongoAreas);
  await upsertLoos(prisma, mappedMongoReports, allMongoLoos);
  await checkDataIntegrity(prisma, mappedMongoReports, allMongoLoos);
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
  mappedMongoReports: MongoReportMap,
  mongoLoos: newloos[]
) => {
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
        opening_times: properties.openingTimes ?? undefined,
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

const checkDataIntegrity = async (
  prisma: PrismaClient,
  mappedMongoReports: MongoReportMap,
  mongoloos: newloos[]
) => {
  console.log('Checking data integrity...');
  const bar = new SingleBar({
    stopOnComplete: true,
    etaBuffer: 30,
    barCompleteChar: '✨',
  });

  bar.start(mongoloos.length, 0);

  let index = 0;

  for (const { properties, ...mongoLoo } of mongoloos) {
    const postgresUpsertResult = await getLooById(prisma, mongoLoo.id);

    const resolvedReports = {};
    for (const report of mongoLoo.reports) {
      resolvedReports[report] = mappedMongoReports[report];
    }

    const mongoNameMap = {
      accessible: 'accessible',
      babyChange: 'baby_change',
      active: 'active',
      allGender: 'all_gender',
      attended: 'attended',
      automatic: 'automatic',
      children: 'children',
      createdAt: 'created_at',
      verifiedAt: 'verified_at',
      updatedAt: 'updated_at',
      name: 'name',
      removalReason: 'removal_reason',
      id: 'legacy_id',
      contributors: 'contributors',
      men: 'men',
      women: 'women',
      noPayment: 'no_payment',
      area: 'areas',
      campaignUOL: 'campaign_uol',
      geometry: 'location',
      notes: 'notes',
      paymentDetails: 'payment_details',
      openingTimes: 'opening_times',
      radar: 'radar',
      reports: 'reports',
      urinalOnly: 'urinal_only',
    } as { [P in keyof NewloosProperties]: string };

    const flatMongoLoo = {
      ...properties,
      ...mongoLoo,
      area: properties.area[0],
    };

    // Double check that the mongo loo is only linked to one area.
    expect(properties.area.length).to.equal(1);

    for (const mongoKey in mongoNameMap) {
      try {
        // Skip campaignUOL as it has been removed from the schema going forward.
        if (mongoKey === 'campaignUOL') {
          continue;
        }

        // Normalise the parsed JSON reports before comparison.
        if (mongoKey === 'reports') {
          expect(JSON.parse(JSON.stringify(resolvedReports))).to.eql(
            JSON.parse(JSON.stringify(postgresUpsertResult.reports))
          );
          continue;
        }

        // Check the lat/lng floats are within 0.000000001 of the expected value.
        // Source of truth in postgres is the PostGIS geometry type, so we need to
        // check the lat/lng values are within a reasonable tolerance against
        // the computed "location" field.
        if (mongoKey === 'geometry') {
          expect(flatMongoLoo['geometry'].coordinates[0]).to.be.closeTo(
            postgresUpsertResult.location['coordinates'][0],
            0.000000001
          );
          expect(flatMongoLoo['geometry'].coordinates[1]).to.be.closeTo(
            postgresUpsertResult.location['coordinates'][1],
            0.000000001
          );
          continue;
        }

        // We store unknown areas as null in postgres.
        if (
          mongoKey === 'area' &&
          flatMongoLoo['area'].name === 'Unknown area'
        ) {
          expect(postgresUpsertResult['areas']).to.eql(null);
          continue;
        }

        const postgresKey = mongoNameMap[mongoKey];
        expect(flatMongoLoo[mongoKey], postgresKey).to.eql(
          postgresUpsertResult[postgresKey]
        );
      } catch (e: unknown) {
        console.error("Integrity check failed for key: '" + mongoKey + "'");
        console.error(e);
      }
    }

    bar.update(index++);
  }

  bar.stop();

  console.log('Done.');

  return undefined;
};
