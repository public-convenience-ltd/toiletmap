const mongoose = require('mongoose');

const LooSchema = require('./schemae/loo');
const ReportSchema = require('./schemae/report');

module.exports = exports = function connect(url) {
  const db = mongoose.createConnection(url);

  return {
    Loo: db.model('NewLoo', LooSchema),
    Report: db.model('NewReport', ReportSchema),
    db,
  };
};
