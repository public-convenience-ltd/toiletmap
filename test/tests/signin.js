var config = require('../../config/config')
var baseUrl = 'http://localhost:' + config.app.port
var supertest = require('supertest')
var request = supertest(baseUrl)

//TODO Add more detail

it('check response from /signin', function (done) {
	request
	.get('/signin')
	.set('Accept', 'text/html')
	.expect(200)
	.end(done)
})
//TODO Add more detail

it('check response from /signout', function (done) {
	request
	.get('/signout')
	.set('Accept', 'text/html')
	.expect(302)
	.end(done)
});

