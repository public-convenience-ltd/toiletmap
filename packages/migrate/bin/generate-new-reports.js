// connect to the mongo db gbptm-api uses with mongoose
require('../legacyModels/config/mongo');

const mongoose = require('mongoose');

const migrate = require('../src/migrate');
const LegacyLoo = require('../legacyModels/loo');
const LegacyReport = require('../legacyModels/loo_report');

// use a main function so we can have await niceties
async function main() {
  try {
    // check they're serious
    if (!process.argv.slice(2).includes('--confirm')) {
      throw Error(
        'Please confirm that you want to drop the existing new-schema loo reports with --confirm.'
      );
    }

    // drop existing report collection.
    console.warn('Dropping existing new-schema loo report collection');
    await migrate.db.dropCollection('newreports');

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
    let legRepIds = (await LegacyReport.distinct('_id')).map(id =>
      id.toString()
    );
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
      const legReps = legLoo.reports.sort((a, b) =>
        a.trust - b.trust !== 0 ? a.trust - b.trust : a.createdAt - b.createdAt
      );

      // check we're not using a report for this loo that was used for another,
      // indicating a database inconsistency
      if (!legReps.every(({ _id }) => !usedEarlier.has(_id))) {
        throw new Error('Fatal error: a report is reused in multiple loos');
      }
      legReps.forEach(({ _id }) => usedEarlier.add(_id));

      newReps = newReps.concat(await migrate.toNewReports(legReps));
    }

    // output reports
    console.error(newReps.length + ' reports generated');
    console.log(JSON.stringify(newReps, null, 2));
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }

  // tidy
  await mongoose.disconnect();
  migrate.db.close();
}

main();
