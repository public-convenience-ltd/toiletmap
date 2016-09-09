'use strict'

var routes = {}

routes.prefences = {
  handler: function * () {
    this.req.logout()
    this.flash = {
      type: 'status',
      msg: "You've signed out sucessfully"
    }
    this.redirect('/')
  },
  path: '/signout',
  method: 'get'
}

module.exports = routes
