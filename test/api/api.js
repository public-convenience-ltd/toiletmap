var config = require('../../config/config'),
    baseUrl = 'http://localhost:'+ config.app.port +'/api',
    app = require('../../app'),
    supertest = require('supertest'),
    request = supertest(baseUrl);

// Bring up a server before each test
beforeEach(function(done){
    app.init(done);
});
// tear it down after
afterEach(function(done){
    app.server.close(done);
});

describe('Loos service', function(){
    it('/loos should return an array of loos', function(done){
        request
            .get('/loos')
            .expect(200, done);
    });
});




