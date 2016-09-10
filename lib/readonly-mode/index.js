var _ = require('lodash')

module.exports = function () {
  return function * (next) {
    if (_.includes(['POST', 'PUT', 'DELETE'], this.method)) {
      this.throw(405, 'GBPTM API is currently in read-only mode')
    }
    yield next
  }
}
