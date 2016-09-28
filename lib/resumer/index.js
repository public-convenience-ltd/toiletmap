var _ = require('lodash')
var parse = require('co-body')

var defaults = {
  cookieName: 'resume_loo_report',
  redirect: function (ctx) {
    return '/signin?redirect=' + ctx.request.url
  },
  restoreFrom: 'resume',
  exclude_paths: []
}

module.exports = function (opts) {
  var settings = _.assign(defaults, opts || {})

  return function * resume (next) {
    // Unauthenticated report post? cookie the body and redirect
    if (this.method === 'POST' && !_.includes(settings.exclude_paths, this.path)) {
      if (!this.isAuthenticated()) {
        var body = yield parse(this)
        this.cookies.set(settings.cookieName, JSON.stringify(body))
        this.redirect(settings.redirect(this))
      }
    }
    // Got auth and cookie - rearrange the request
    if (this.cookies.get(settings.cookieName) && this.method === 'GET' && this.isAuthenticated()) {
      this.method = 'POST'
      this.state[settings.restoreFrom] = JSON.parse(this.cookies.get(settings.cookieName))
      this.cookies.set(settings.cookieName)
    }
    yield next
  }
}
