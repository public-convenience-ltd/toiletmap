var LooReport = require('../../models/loo_report');
var config = require('../../config/config');
var parse = require('co-body');
var routes = {};

function* save(data, user) {
  data.userId = user.userId;
  data.trust = config.reports.trust - 1;
  data.collectionMethod = 'ingest';
  var validator = new LooReport(data);

  try {
    yield validator.validate();
  } catch (e) {
    throw e;
  }
  return yield LooReport.processReport(data);
}

function* handleReport() {
  if (this.is('json')) {
    var data = yield parse(this);
    var results = yield save(data, this.req.user);
    this.status = 201;
    this.set(
      'Location',
      this.app.url('report', {
        id: results[0]._id,
      })
    );
    this.set(
      'Content-Location',
      this.app.url('loo', {
        id: results[1]._id,
      })
    );
  } else {
    this.status = 400;
  }
}

routes.ingest_report = {
  handler: handleReport,
  path: '/admin/ingest',
  method: 'post',
  scope: 'ingest',
};

module.exports = routes;
