var config = require('../../config/config'),
    baseUrl = 'http://localhost:'+ config.app.port,
    app = require('../../app'),
    thunk = require('thunkify'),
    co = require('co'),
    supertest = require('supertest'),
    request = supertest(baseUrl),
    _ = require('lodash'),
    fakery = require('../fixtures'),
    Loo = require('../../models/loo');

Loo.remove = thunk(Loo.remove);

describe('Loos service', function(){

    // Bring up a server before testing
    before(function(done){
        app.tinit = thunk(app.init);
        co(function *(){
            yield app.tinit();
            // Add 12 fake loos
            yield _.map(_.range(12), function(){
                return fakery.makeAndSave('loo');
            });
        })(done);
    });
    // tear it down after
    after(function(done){
        app.server.tclose = thunk(app.server.close);
        co(function *(){
            yield app.server.tclose();
            yield Loo.remove({});
        })(done);
    });

    it('/loos should return an array of loos', function(done){          
        request
            .get('/loos')
            .expect(200)
            .expect('Total-Count', '12')
            .end(done);
    });
});




