const { dbConnect, Report } = require('../src/api/db/index.ts');
import reports from './mock-reports.json';
import { MongoMemoryServer } from 'mongodb-memory-server';
import areaToDatabase from '../src/api/db/manage/areaToDatabase/lib';

import { SingleBar } from 'cli-progress';

(async () => {
  const mongoInstance = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'toiletmap',
    },
  });

  process.once('SIGUSR2', async function () {
    await mongoInstance.stop();
    process.kill(process.pid, 'SIGUSR2');
  });

  await dbConnect();

  // Load areas.
  await areaToDatabase(false);

  const bar = new SingleBar({
    stopOnComplete: true,
    etaBuffer: 30,
    barCompleteChar: '✨',
  });

  console.log('Populating the database from mock-reports.json');

  bar.start(reports.length, 0);
  for (let i = 0; i < reports.length; i++) {
    const [looId, reportData] = reports[i];
    await Report.submit(
      reportData,
      { [process.env.AUTH0_PROFILE_KEY]: { nickname: 'Test User' } },
      null,
      looId
    );
    bar.update(i + 1);
  }

  bar.stop();

  console.log('Done.');

  console.log('====');

  console.log('Server started');
})();
