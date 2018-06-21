const config = require('./config/config');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('./config/mongo'); // don't much like this bare require

const app = express();

app.use(helmet());
app.use(compression());

// Add public API routes
const publicRoutes = require('./routes/public');
app.use('/api', publicRoutes);

// Serve the built UI from the root
app.use(express.static(path.join(__dirname, 'www')));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// auto-init if this app is not being initialised by another module
if (!module.parent) {
  app.listen(config.app.port, () =>
    /* eslint-disable-next-line no-console */
    console.log(`Listening on port ${config.app.port}`)
  );
}

module.exports = app;
