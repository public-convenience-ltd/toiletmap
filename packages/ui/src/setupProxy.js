const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const platformWWW = path.resolve(
  __dirname,
  '..',
  'platforms',
  'android',
  'platform_www'
);

//  Copied + configured from cordova-config.js
const appID = 'uk.org.toiletmap';

module.exports = function(app) {
  const cordovaStaticServer = express.static(platformWWW, {
    fallthrough: true,
  });
  app.use((req, res, next) => {
    const requestedWith = req.headers['x-requested-with'];
    if (requestedWith === appID) {
      return cordovaStaticServer(req, res, next);
    }

    next();
  });

  app.use(
    '/graphql',
    createProxyMiddleware({
      target: process.env.PROXY || 'https://gbptm-stage.herokuapp.com',
      //secure: false,
      changeOrigin: true,
    })
  );
};
