var _ = require('lodash')

module.exports = function () {
  return function * (next) {
    if (_.contains(['POST', 'PUT', 'DELETE'], this.method)) {
      this.thow(405, 'GBPTM API is currently in read-only mode')
    }
    yield next
  }
}
