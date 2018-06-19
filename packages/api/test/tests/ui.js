/* global describe, before, after, it */
var config = require('../../config/config');
var baseUrl = 'http://localhost:' + config.app.port;
var co = require('co');
var supertest = require('supertest');
var request = supertest(baseUrl);
var Loo = require('../../models/loo');
var loader = require('../loader.js').dataLoader;

describe('A test to trigger handlers', function() {
  var looGlobal = null;
  before(function(done) {
    loader(Loo, 'looEmpty', function(err, result) {
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
