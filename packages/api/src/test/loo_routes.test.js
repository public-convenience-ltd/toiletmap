const request = require('supertest');
const app = require('../index');
const Loo = require('../models/loo');
const mongoose = require('mongoose');
const looRadius = require('./data/looRadius.js');

beforeAll(async () => {
  await Loo.ensureIndexes();
});

describe('api loo routes (public)', () => {
  describe('/api/loos/near/:lon/:lat', () => {
    beforeAll(async () => {
      await Loo.collection.insertMany(looRadius);
    });

    it('should return a limit of 5 loos for -0.2068223/51.518342', async () => {
      const response = await request(app).get(
        '/api/loos/near/-0.2068223/51.518342/'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.features.length).toBe(5);
    });

    it('should return 20 loos for -0.2068223/51.518342', async () => {
      const response = await request(app).get(
        '/api/loos/near/-0.2068223/51.518342/?limit=20'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.features.length).toBe(20);
    });

    it('should return 0 loos for 51.518342/-0.2068223', async () => {
      const response = await request(app).get(
        '/api/loos/near/51.518342/-0.2068223'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.features.length).toBe(0);
    });

    afterAll(async () => {
      await Loo.remove({}).exec();
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
