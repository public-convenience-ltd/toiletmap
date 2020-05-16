const { Report, db } = require('../../index.js')(process.env.MONGODB_URI);
const mongoose = require('mongoose');

async function generateFromReports() {
  // Find all reports that start a list.
  const tailReports = await Report.find({
    previous: { $exists: false },
  }).exec();
  const newLoos = [];
  for (const report of tailReports) {
    let root = report;
    // Traverse each linked report list to find the root report.
    while (root.next) {
      await root.populate('next').execPopulate();
      root = root.next;
    }
    // Generate a loo from each root report and save it.
    const newLoo = await root.generateLoo();
    newLoos.push(newLoo);
    await newLoo.save();
  }
  return newLoos;
}

// use a main function so we can have await niceties
async function main() {
  try {
    // check they're serious
    if (!process.argv.slice(2).includes('--confirm')) {
      throw Error(
        'Please confirm that you want to drop the existing new-schema loos with --confirm.'
      );
    }

    // drop existing loo collection
    console.warn('Dropping existing new-schema loo collection');
    await db.dropCollection('newloos');

    // create set of new loos from new reports
    console.warn('Migrating loos across from new reports');
    const newLoos = await generateFromReports();

    console.error(newLoos.length + ' loos generated');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }

  // tidy
  await mongoose.disconnect();
  db.close();
}

main();
