const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/graphql',
    createProxyMiddleware({
      target: process.env.PROXY || 'https://gbptm-stage.herokuapp.com',
      //secure: false,
      changeOrigin: true,
    })
  );
};
