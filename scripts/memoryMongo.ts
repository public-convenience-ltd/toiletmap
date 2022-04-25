const { dbConnect, Report } = require('./src/api/db/index.ts');
import { MongoMemoryServer } from 'mongodb-memory-server';
import areaToDatabase from '../src/api/db/manage/areaToDatabase/lib';

import { Types } from 'mongoose';

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

  //   await Report.submit(
  //     report,
  //     { [process.env.AUTH0_PROFILE_KEY]: { nickname: 'Test User' } },
  //     null,
  //     new Types.ObjectId(faker.database.mongodbObjectId())
  //   );
  // }

  // console.log('Done');
})();
