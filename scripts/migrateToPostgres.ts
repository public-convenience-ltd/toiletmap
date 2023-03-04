import { PrismaClient, Prisma, toilets } from '@prisma/client';
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

type MongoMapKeys = keyof (Omit<newloos, 'properties'> & NewloosProperties);

// Ensure that we have a mapping between all the mongo keys and the postgres keys.
const mongoNameMap: { [P in MongoMapKeys & { _id: string }]: string } = {
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
  id: 'id',
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
  urinalOnly: 'urinal_only',
} as const;

// Coerce the raw mongo data into the format we expect.
const prepareMongoReport = (report) => {
  const finalReport = {
    ...report,
  };
  const id = finalReport._id['$oid'];
  const next = finalReport.next ? finalReport.next['$oid'] : null;
  const previous = finalReport.previous ? finalReport.previous['$oid'] : null;
  const createdAt = finalReport.createdAt
    ? new Date(finalReport.createdAt['$date'])
    : null;
  const updatedAt = finalReport.updatedAt
    ? new Date(finalReport.updatedAt['$date'])
    : null;
  const verifiedAt = finalReport.diff?.verifiedAt
    ? new Date(finalReport.diff.verifiedAt['$date'])
    : null;
  finalReport['id'] = id;
  finalReport['next'] = next;
  finalReport['previous'] = previous;
  finalReport['createdAt'] = createdAt;
  finalReport['updatedAt'] = updatedAt;
  if (verifiedAt) {
    finalReport['diff'] = {
      ...finalReport['diff'],
      verifiedAt,
    };
  }
  delete finalReport.diff?.campaignUOL;
  return finalReport;
};

(async () => {
  console.log('Connecting to MongoDB...');
  const mongoPrisma = new PrismaClientMongo();
  await mongoPrisma.$connect();
  console.log('Connecting to PostgreSQL...');
  const prisma = new PrismaClient();
  await prisma.$connect();

  console.log('Fetching areas from mongo...');
  const allMongoAreas = await mongoPrisma.areas.findMany();
  console.log('upserting areas to postgres...');

  console.log('Fetching loo data from Mongo...');
  const allMongoLoos = await mongoPrisma.newloos.findMany();

  console.log('Fetching report data from Mongo...');
  const allMongoReports = await mongoPrisma.newreports.findRaw();

  const mappedMongoReports: Record<string, newreports> = {};
  for (const report of allMongoReports) {
    const id = report._id['$oid'];
    mappedMongoReports[id] = prepareMongoReport(report);
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
    await upsertArea(prisma, { ...area, id: area.id });
    bar.update(index++);
  }

  bar.stop();

  console.log('Done upserting areas.');
};

const upsertLoos = async (
  prisma: PrismaClient,
  mappedMongoReports: Record<string, newreports>,
  mongoLoos: newloos[],
  limit = -1
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
    if (index === limit) break;
    const currentLooReports = loo.reports.map(
      (reportId) => mappedMongoReports[reportId]
    );

    // generate the loo from the sequence of diffs
    const properties: Partial<toilets> = {};

    // Calculate the Loo's creation and update time - we sort the report creation times to do this since
    // early reports were ranked on trust as well...
    const timeline = [...currentLooReports].sort((d2, d1) => {
      if (d1.createdAt < d2.createdAt) return 1;
      if (d1.createdAt > d2.createdAt) return -1;
      return 0;
    });

    const createdAtBasedOnChronologicalReports = timeline[0].createdAt;

    const contributorBuild = [];

    let reportIndex = 0;

    // Successively apply the diffs to build up the final loo.
    for (const rep of currentLooReports) {
      // Unroll the current diff and apply it to the WIP loo object.
      for (const [key, value] of Object.entries(rep.diff)) {
        const mappedKey = mongoNameMap[key];
        if (value === null) {
          if (mappedKey === 'opening_times') {
            properties[mappedKey] = Prisma.DbNull;
            continue;
          }
          // null indicates that the value was unset in this report
          properties[mappedKey] = null;
        } else if (value !== undefined) {
          if (key === 'geometry') continue;
          // otherwise, if we have a valid property, update it within the loo
          properties[mappedKey] = value;
        }
      }

      // Build up the contributor list as we go.
      contributorBuild.push(rep.contributor);

      const updatedAtBasedOnChronologicalReports =
        timeline[reportIndex].createdAt;

      // After we've unrolled the chain of reports, we're ready to upsert that data that we've collated.

      // TODO the migrated created_at and updated_at fields are not being set correctly.
      await upsertLoo(
        prisma,
        postgresUpsertLooQuery(
          loo.id,
          {
            ...properties,
            created_at: createdAtBasedOnChronologicalReports,
            updated_at: updatedAtBasedOnChronologicalReports,
            verified_at: rep.diff.verifiedAt,
            contributors: contributorBuild,
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

      reportIndex++;
    }

    bar.update(index++);
  }

  bar.stop();
  console.log('Done upserting loo reports.');
};

const checkDataIntegrity = async (
  prisma: PrismaClient,
  mappedMongoReports: MongoReportMap,
  mongoloos: newloos[],
  limit = -1
) => {
  console.log('Checking data integrity...');
  const bar = new SingleBar({
    stopOnComplete: true,
    etaBuffer: 30,
    barCompleteChar: '✨',
  });

  bar.start(mongoloos.length, 0);

  let index = 0;

  // TODO: check that the audit table is correct as well as the final loo object.

  for (const { properties, ...mongoLoo } of mongoloos) {
    if (index === limit) {
      break;
    }
    const postgresUpsertResult = await getLooById(prisma, mongoLoo.id);

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

        // Reports are now represented by the audit table and not included on the Postgres loo.
        if (mongoKey === 'reports') {
          continue;
        }

        // Contributors will include system location updates, we need to account for these.
        // This is because upserting a user is a two step process for now as Prisma doesn't support PostGIS.
        // 1. Upsert the user data.
        // 2. Set the user geometry as a separate query.
        if (mongoKey === 'contributors') {
          for (const contributor of flatMongoLoo['contributors']) {
            expect(postgresUpsertResult['contributors']).to.contain(
              contributor
            );
          }
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
        // Area membership is computed by a database trigger on upsert.
        if (
          mongoKey === 'area' &&
          flatMongoLoo['area'].name === 'Unknown area'
        ) {
          expect(postgresUpsertResult['areas']).to.eql(null);
          continue;
        }

        // Check for parity between the mongo loo and the loo generated from unrolled historical reports.
        const postgresKey = mongoNameMap[mongoKey];
        expect(postgresUpsertResult[postgresKey], postgresKey).to.eql(
          flatMongoLoo[mongoKey]
        );
      } catch (e: unknown) {
        // Shout about any generated loos that don't match up.
        console.error('Integrity check failed for: ', mongoLoo.id);
        console.error(e);
        console.log(flatMongoLoo[mongoKey]);
        console.log('------');
      }
    }

    bar.update(index++);
  }

  bar.stop();

  console.log('Done.');

  return undefined;
};
