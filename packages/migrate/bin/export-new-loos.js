// connect to the mongo db gbptm-api uses with mongoose
require('@neontribe/gbptm-api/src/config/mongo');

const mongoose = require('mongoose');
const migrate = require('../src/migrate');

// use a main function so we can have await niceties
async function main() {
  // Drop exsiting loo collection.
  console.warn('Dropping existing loo collection.');
  await migrate.db.dropCollection('newloos');

  // Create set of new loos from new reports.
  console.warn('Migrating loos across from new reports.');
  const newLoos = await migrate.toNewLoos();

  // output new loos
  console.log(JSON.stringify(newLoos, null, 2));

  // tidy
  await mongoose.disconnect();
  migrate.db.close();
}

main();
