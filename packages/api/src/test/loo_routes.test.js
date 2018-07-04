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

    it('should return 20 loos for -0.2068223/51.518342, default radius', async () => {
      const response = await request(app).get(
        '/api/loos/near/-0.2068223/51.518342/'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.features.length).toBe(20);
    });

    it('should return 8 loos for -0.2068223/51.518342, 1km radius', async () => {
      const response = await request(app).get(
        '/api/loos/near/-0.2068223/51.518342/?radius=1000'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.features.length).toBe(8);
    });

    it('should return 0 loos for 51.518342/-0.2068223, default radius', async () => {
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
