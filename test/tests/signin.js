var config = require('../../config/config')
var baseUrl = 'http://localhost:' + config.app.port
var supertest = require('supertest')
var request = supertest(baseUrl)


it('check response from /signin', function (done) {
	request
	.get('/signin')
	.set('Accept', 'text/html')
	.expect(200)
	.end(done)
})
it('check response from /signout', function (done) {
	request
	.get('/signout')
	.set('Accept', 'text/html')
	.expect(302)
	.end(done)
});

