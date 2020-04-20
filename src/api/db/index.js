const mongoose = require('mongoose');

const LooSchema = require('./loo');
const ReportSchema = require('./report');

module.exports = exports = function connect(url) {
  mongoose.set('useCreateIndex', true);
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useUnifiedTopology', true);
  const db = mongoose.createConnection(url);

  return {
    Loo: db.model('NewLoo', LooSchema),
    Report: db.model('NewReport', ReportSchema),
    db,
  };
};
