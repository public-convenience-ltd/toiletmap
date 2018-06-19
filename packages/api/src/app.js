const config = require('./config/config');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
require('./config/mongo'); // don't much like this bare require

const app = express();

app.use(helmet());
app.use(compression());

// Add public API routes
const publicRoutes = require('./routes/public');
app.use('/api', publicRoutes);

// auto-init if this app is not being initialised by another module
if (!module.parent) {
  app.listen(config.app.port, () =>
    /* eslint-disable-next-line no-console */
    console.log(`Listening on port ${config.app.port}`)
  );
}

module.exports = app;
