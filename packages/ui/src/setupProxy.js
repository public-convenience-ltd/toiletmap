const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    proxy('/api', {
      target: process.env.PROXY || 'https://gbptm-unity.herokuapp.com',
      //secure: false,
      changeOrigin: true,
    })
  );
};
