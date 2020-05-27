const { Report, connect } = require('../../index.js');
const mongoose = require('mongoose');
const cliProgress = require('cli-progress');

// use a main function so we can have await niceties
async function main() {
  await connect(process.env.MONGODB_URI);
  try {
    // check they're serious
    if (!process.argv.slice(2).includes('--confirm')) {
      throw Error(
        'Please confirm that you want to drop the existing loos with --confirm.'
      );
    }
    // drop existing loo collection
    console.warn('Dropping existing loo collection');

    try {
      await mongoose.connection.dropCollection('newloos');
    } catch (e) {
      // 26 is collection not found :-) a fresh db
      if (e.code !== 26) {
        throw e;
      }
    }

    // Collect originating reports
    console.log('Collecting originating reports');
    const reports = await Report.find({
      previous: { $exists: false },
    }).exec();

    // create set of new loos from reports
    console.log('Generating loos from reports');
    const bar = new cliProgress.SingleBar({
      stopOnComplete: true,
      etaBuffer: 30,
    });
    bar.start(reports.length, 0);
    const newLoos = [];
    for (const report of reports) {
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
      bar.update(newLoos.length);
    }

    bar.stop();
    console.log(newLoos.length + ' loos generated');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }

  // tidy
  await mongoose.disconnect();
}

main();
