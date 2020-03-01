const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.PROXY || 'https://gbptm-stage.herokuapp.com',
      //secure: false,
      changeOrigin: true,
    })
  );
  app.use(
    '/graphql',
    createProxyMiddleware({
      target: process.env.PROXY || 'https://gbptm-stage.herokuapp.com',
      //secure: false,
      changeOrigin: true,
    })
  );
};
