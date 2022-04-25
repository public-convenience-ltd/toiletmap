import faker from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';

const generateReports = () => {
  const reports = [];
  for (let i = 0; i < 5000; i++) {
    faker.seed(new Array(5).fill(i));
    const location = [
      parseFloat(faker.address.longitude(0.2, -0.6, 6)),
      parseFloat(faker.address.latitude(51.7, 51.3, 6)),
    ];

    // Populate the database with some London toilets.
    reports.push([
      new Types.ObjectId(faker.database.mongodbObjectId()),
      {
        active: true,
        name: faker.word.adjective() + ' ' + faker.word.noun(),
        geometry: {
          type: 'Point',
          coordinates: location,
        },
      },
    ]);
  }

  fs.writeFileSync(
    path.join(__dirname, 'mock-reports.json'),
    JSON.stringify(reports)
  );
};

generateReports();
