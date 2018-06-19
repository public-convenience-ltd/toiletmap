'use strict';
const config = require('./config/config');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
require('./config/mongo'); // don't much like this bare require

const app = express();
app.use(helmet());
app.use(compression());

// Add public routes for loos
const looRoutes = require('./api/public/loo');
looRoutes.forEach(route => {
  app[route.method](route.path, route.handler);
});

// Add public routes for reports
const reportRoutes = require('./api/public/report');
reportRoutes.forEach(route => {
  app[route.method](route.path, route.handler);
});

// Add public routes for search
const searchRoutes = require('./api/public/search');
searchRoutes.forEach(route => {
  app[route.method](route.path, route.handler);
});

// Add public routes for statistics
const statsRoutes = require('./api/public/statistics');
statsRoutes.forEach(route => {
  app[route.method](route.path, route.handler);
});

// Add public routes for areas
const areasRoutes = require('./api/public/areas');
areasRoutes.forEach(route => {
  app[route.method](route.path, route.handler);
});

// auto-init if this app is not being initialised by another module
if (!module.parent) {
  app.listen(config.app.port, () =>
    /* eslint-disable-next-line no-console */
    console.log(`Listening on port ${config.app.port}`)
  );
}

module.exports = app;
