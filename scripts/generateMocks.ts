import faker from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';
import _ from 'lodash';

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
        men: faker.datatype.boolean(),
        women: faker.datatype.boolean(),
        children: faker.datatype.boolean(),
        noPayment: faker.datatype.boolean(),
        babyChange: faker.datatype.boolean(),
        urinalOnly: faker.datatype.boolean(),
        radar: faker.datatype.boolean(),
        accessible: faker.datatype.boolean(),
        allGender: faker.datatype.boolean(),
        verifiedAt: faker.date.future(),
        paymentDetails: `£${faker.finance.amount(0, 10)} on entry`,
        notes:
          faker.word.adjective() +
          ' toilet!! ' +
          faker.word.conjunction() +
          ' ' +
          faker.word.noun() +
          ' ' +
          faker.word.verb() +
          '!',
        openingTimes: _.times(7, () =>
          faker.date
            .betweens('2020-01-01T00:00:00.000Z', '2020-01-01T23:59:59.000Z', 2)
            .map(
              (v) =>
                `${('0' + v.getHours()).slice(-2)}:${(
                  '0' + v.getMinutes()
                ).slice(-2)}`
            )
        ),
      },
    ]);
  }

  fs.writeFileSync(
    path.join(__dirname, 'mock-reports.json'),
    JSON.stringify(reports)
  );
};

generateReports();
