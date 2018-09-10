// connect to the mongo db gbptm-api uses with mongoose
require('@neontribe/gbptm-api/src/config/mongo');

const mongoose = require('mongoose');

const migrate = require('../lib/migrate');
const { LegacyLoo, LegacyReport } = require('../lib/models');

// use a main function so we can have await niceties
async function main() {
  // get Loos
  let legLoos = await LegacyLoo.find({}, { reports: 1 }).populate('reports');
  console.error(legLoos.length + ' reports fetched');

  // apply patches, see https://github.com/neontribe/gbptm/issues/330
  legLoos = legLoos.filter(
    loo =>
      ![
        '56a0c7248612ef1000e0cb8a',
        '56a101d98612ef1000e0cb96',
        '56a101d98612ef1000e0cb97',
        '5871556ab78da900110352b2',
        '59e4da8784549a001137f13d',
      ].includes(loo._id.toString())
  );
  const badLoo = legLoos.find(
    loo => loo._id.toString() === '5810924f3fdc0700105f0719'
  );
  if (badLoo) {
    badLoo.reports.splice(
      badLoo.reports
        .map(rep => rep._id.toString())
        .indexOf('5810a184d0e3fbe3bd5e48f6'),
      1
    );
  }

  // look for orphaned reports and missing reports
  let legRepIds = (await LegacyReport.distinct('_id')).map(id => id.toString());
  let usedRepIds = (await LegacyLoo.distinct('reports')).map(id =>
    id.toString()
  );

  console.warn(
    legRepIds.filter(id => !usedRepIds.includes(id)).length +
      ' orphaned reports, ignoring'
  );
  console.warn(
    usedRepIds.filter(id => !legRepIds.includes(id)).length +
      ' loo references to non-existent reports, ignoring'
  );

  // make set of new reports for each loo's set of legacy reports and look for reused reports
  const usedEarlier = new Set();
  let newReps = [];
  for (const legLoo of legLoos) {
    // sort by trust in ascending order, then by createdAt date from oldest to newest
    const legReps = legLoo.reports.sort(
      (a, b) =>
        a.trust - b.trust !== 0 ? a.trust - b.trust : a.createdAt - b.createdAt
    );

    // check we're not using a report for this loo that was used for another,
    // indicating a database inconsistency
    if (!legReps.every(({ _id }) => !usedEarlier.has(_id))) {
      // TODO critical failure, exit
      console.error('Fatal error, a report is reused in multiple loos');
      process.exitCode = 1;
    }
    legReps.forEach(({ _id }) => usedEarlier.add(_id));

    newReps = newReps.concat(await migrate.toNewReports(legReps));
  }

  // ensure we created valid reports
  for (const report of newReps) {
    try {
      // TODO maybe this is irrelevant now that we're adding to the DB
      await report.validate();
    } catch (err) {
      console.error(err.stack);
      console.error(JSON.stringify(report, null, 2));
      newReps = [];
      process.exitCode = 1;
      break;
    }
  }

  // output reports
  console.error(newReps.length + ' reports generated');
  console.log(JSON.stringify(newReps, null, 2));

  // tidy
  await mongoose.connection.close();
}

main();
