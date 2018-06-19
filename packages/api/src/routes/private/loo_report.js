var LooReport = require('../../models/loo_report');
var Loo = require('../../models/loo');
var config = require('../../config/config');
var parse = require('co-body');
var _ = require('lodash');
var routes = {};

function* save(data, user) {
  data.attribution = user.name;
  data.userId = user.userId;
  data.trust = config.reports.trust;
  data.collectionMethod = 'api';
  var validator = new LooReport(data);

  try {
    yield validator.validate();
  } catch (e) {
    throw e;
  }
  return yield LooReport.processReport(data);
}

function* handleJSON(next) {
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
    yield next;
  }
}

routes.submit_report = {
  handler: handleJSON,
  path: '/reports',
  method: 'post',
};

routes.remove = {
  handler: function*() {
    var loo = yield Loo.findById(this.params.id).exec();
    // var raw = yield resumeBody(this);
    var raw = {};
    var report = _.pick(loo.toObject(), 'type', 'geometry');
    _.extend(report, {
      properties: {
        active: false,
        access: 'none',
        removal_reason: raw.removal_reason,
      },
      origin: raw.origin,
    });
    try {
      yield save(report, this.req.user);
    } catch (e) {
      this.throw(
        400,
        _.map(e.errors, 'message')
          .concat(['Provided: ' + JSON.stringify(report, null, '\t')])
          .join('\n')
      );
    }

    this.flash = {
      type: 'status',
      msg: "Thanks! We won't show that toilet on the map any more.",
    };

    this.redirect(
      '/loos/near/' +
        loo.geometry.coordinates[0] +
        '/' +
        loo.geometry.coordinates[1]
    );
  },
  path: '/remove/:id',
  method: 'post',
};

module.exports = routes;
