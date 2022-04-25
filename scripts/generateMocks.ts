import faker from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

const generateReports = () => {
  const reports = [];
  for (let i = 0; i < 1000; i++) {
    faker.seed(new Array(5).fill(i));
    const location = [
      parseFloat(faker.address.longitude(1.5, -2.0, 6)),
      parseFloat(faker.address.latitude(51.9, 51.1, 6)),
    ];

    // Populate the database with some London toilets.
    reports.push({
      active: true,
      name: faker.word.adjective() + ' ' + faker.word.noun(),
      geometry: {
        type: 'Point',
        coordinates: location,
      },
    });
  }

  fs.writeFileSync(
    path.join(__dirname, 'mock-reports.json'),
    JSON.stringify(reports)
  );
};

generateReports();
