var config = require('../../config/config')
var baseUrl = 'http://localhost:' + config.app.port
var supertest = require('supertest')
var request = supertest(baseUrl)

it('/', function (done) {
	request
	.get('/')
	.set('Accept', 'text/html')
	.expect(200)
	.end(done)
});

it('/about', function (done) {
	request
	.get('/about')
	.set('Accept', 'text/html')
	.expect(200)
	.end(done)
});
it('/preferences', function (done) {
	request
	.get('/preferences')
	.set('Accept', 'text/html')
	.expect(200)
	.end(done)
});

