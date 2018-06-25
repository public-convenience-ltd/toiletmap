const request = require('supertest');
const app = require('../index');
const Loo = require('../models/loo');
const mongoose = require('mongoose');
const looRadius = require('./data/looRadius.js');

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

  describe('/api/loos/in/:sw/:ne/:nw/:se', () => {
    const looBox = require('./data/looBox.js');
    beforeAll(async () => {
      await Loo.collection.insertMany(looBox);
    });

    it('should return 12 loos', async () => {
      const response = await request(app).get(
        '/api/loos/in/-24.2,44.5/20.3,60.4/-24.2,60.4/20.3,44.5'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.features.length).toBe(12);
    });

    afterAll(async () => {
      await Loo.remove({}).exec();
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
