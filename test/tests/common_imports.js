var config = require('../../config/config')
var baseUrl = 'http://localhost:' + config.app.port
var supertest = require('supertest')
var request = supertest(baseUrl)

exports.config = config;
exports.baseUrl = baseUrl;
exports.supertest = supertest;
exports.request = request;

