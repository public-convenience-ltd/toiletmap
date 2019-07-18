const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    proxy('/api', {
      target: process.env.PROXY || 'https://gbptm-stage.herokuapp.com',
      //secure: false,
      changeOrigin: true,
    })
  );
  app.use(
    proxy('/graphql', {
      target: process.env.PROXY || 'https://gbptm-stage.herokuapp.com',
      //secure: false,
      changeOrigin: true,
    })
  );
};
