// connect to the mongo db gbptm-api uses with mongoose
require('@neontribe/gbptm-api/src/config/mongo');

const mongoose = require('mongoose');

const migrate = require('../lib/migrate');
const { LegacyReport } = require('../lib/models');

// use a main function so we can have await niceties
async function main() {
  const legacies = await LegacyReport.find();
  let reports = migrate.toNewReports(legacies);

  // ensure we created valid reports
  for (const report of reports) {
    try {
      await report.validate();
    } catch (err) {
      console.error(err.stack);
      console.error(JSON.stringify(report, null, 2));
      reports = [];
      process.exitCode = 1;
      break;
    }
  }

  // spit out the new reports we generated
  console.log(JSON.stringify(reports, null, 2));

  // tidy
  await mongoose.connection.close();
}

main();
