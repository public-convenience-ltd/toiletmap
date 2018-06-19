/* global describe, before, after, it */
var config = require('../../config/config');
var baseUrl = 'http://localhost:' + config.app.port;
var co = require('co');
var supertest = require('supertest');
var request = supertest(baseUrl);
var Loo = require('../../models/loo');
var loader = require('../loader.js').dataLoader;

describe('Find loos within a box (/loos/in)', function() {
  before(function(done) {
    loader(Loo, 'looBox', function(err, result) {
      done();
      return result;
    });
  });
  after(function(done) {
    co(function*() {
      yield Loo.remove({});
    }).then(done);
  });

  it('/loos/in/:sw/:ne/:nw/:se', function(done) {
    request
      .get('/loos/in/-24.2,44.5/20.3,60.4/-24.2,60.4/20.3,44.5')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(function(res) {
        if (!(res.body.features.length === 12)) {
          return 'Not enough Loos';
        }
      })
      .end(done);
  });
});

describe('Find loos within radius (/loos/near)', function() {
  // Bring up a server before testing
  before(function(done) {
    loader(Loo, 'looRadius', function(err, result) {
      done();
      return result;
    });
  });
  // tear it down after
  after(function(done) {
    co(function*() {
      yield Loo.remove({});
    }).then(done);
  });

  it('/loos/near/:lon/:lat JSON with default limit', function(done) {
    request
      .get('/loos/near/-0.2068223/51.518342/')
      .set('Accept', 'application/json')
      .query({ radius: 2000 })
      .expect(200)
      .expect(function(res) {
        if (!(res.body.features.length === 5)) {
          return 'Not correct amount of loos';
        }
      })
      .end(done);
  });

  it('/loos/near/:lon/:lat JSON with limit of 17', function(done) {
    request
      .get('/loos/near/-0.2068223/51.518342/?radius=2000&limit=20')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(function(res) {
        if (!(res.body.features.length === 20)) {
          return 'Not correct amount of loos';
        }
      })
      .end(done);
  });
});

describe('Find loos via ID ( /loos/:id/)', function() {
  var looGlobal = null;
  before(function(done) {
    loader(Loo, 'looID', function(err, result) {
      looGlobal = result.ops[0];
      done();
      return result;
    });
  });

  // tear it dewn after
  after(function(done) {
    co(function*() {
      yield Loo.remove({});
    }).then(done);
  });

  it('/loos/:id JSON', function(done) {
    request
      .get('/loos/' + looGlobal._id.toString())
      .set('Accept', 'application/json')
      .expect(200)
      .expect(function(res) {
        if (!res.body) {
          return 'Not enough Loos';
        }
      })
      .end(done);
  });
});
