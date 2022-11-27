import { PrismaClient } from '@prisma/client';
import {
  newloos,
  areas,
  newreports,
  PrismaClient as PrismaClientMongo,
  NewloosProperties,
  NewreportsDiff,
} from '../generated/schemaMongo';
import { SingleBar } from 'cli-progress';
import { getLooById, upsertArea, upsertLoo } from '../src/api/prisma/queries';
import { postgresUpsertLooQuery } from '../src/api/graphql/helpers';
import { expect } from 'chai';

type MongoReportMap = { [reportId: string]: newreports };

type MongoMapKeys = keyof (Omit<newloos, 'properties'> & NewloosProperties);
const mongoNameMap: { [P in MongoMapKeys]: string } = {
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
  v: undefined,
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
};

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

  const mappedMongoReports: Record<string, newreports> = {};
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
  allMongoReports: Record<string, newreports>,
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
    const currentLooReports = loo.reports.map(
      (reportId) => mappedMongoReports[reportId]
    );

    // generate the loo from the sequence of diffs
    const properties: Partial<NewreportsDiff> = {};
    // Get just the IDs of the report list to populate Loo metadata
    const reportIds = currentLooReports.map((val) => val.id);

    // Calculate the Loo's creation and update time - we sort the report creation times to do this since
    // early reports were ranked on trust as well...
    const timeline = currentLooReports
      .map((r) => r.createdAt)
      .sort((d1, d2) => {
        if (d1 > d2) return 1;
        if (d1 < d2) return -1;
        return 0;
      });

    const createdAt = timeline[0];
    const updatedAt = timeline[timeline.length - 1];

    for (const rep of currentLooReports) {
      for (const [key, value] of Object.entries(rep.diff)) {
        const mappedKey = mongoNameMap[key];
        if (value === null) {
          // null indicates that the value was unset in this report
          delete properties[mappedKey];
        } else if (value !== undefined) {
          if (key === 'geometry') continue;
          // otherwise, if we have a valid property, update it within the loo
          properties[mappedKey] = value;
        }
      }

      await upsertLoo(
        prisma,
        postgresUpsertLooQuery(
          loo.id,
          {
            ...properties,
            created_at: createdAt,
            updated_at: updatedAt,
            legacy_id: loo.id,
            reports: reportIds,
            contributors: loo.contributors,
          },
          rep.diff?.geometry
            ? {
                lat: rep.diff?.geometry.coordinates[1],
                lng: rep.diff?.geometry.coordinates[0],
              }
            : undefined
        ),
        false
      );
    }

    bar.update(index++);
  }

  bar.stop();
  console.log('Done upserting loo reports.');
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

    const flatMongoLoo = {
      ...properties,
      ...mongoLoo,
      area: properties.area[0],
    };

    // Double check that the mongo loo is only linked to one area.
    expect(properties.area.length).to.equal(1);

    for (const mongoKey in mongoNameMap) {
      try {
        // We don't care about the v property.
        if (mongoKey === 'v') {
          continue;
        }

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
