// connect to the mongo db gbptm-api uses with mongoose
require('../legacyModels/config/mongo');

const mongoose = require('mongoose');
const migrate = require('../src/migrate');

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
    await migrate.db.dropCollection('newloos');

    // create set of new loos from new reports
    console.warn('Migrating loos across from new reports');
    const newLoos = await migrate.toNewLoos();

    // output new loos
    console.error(newLoos.length + ' loos generated');
    console.log(JSON.stringify(newLoos, null, 2));
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }

  // tidy
  await mongoose.disconnect();
  migrate.db.close();
}

main();
