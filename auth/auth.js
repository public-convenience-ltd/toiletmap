var passport = require('koa-passport')
var DigestStrategy = require('passport-http').DigestStrategy
var BearerStrategy = require('passport-http-bearer').Strategy
var TwitterStrategy = require('passport-twitter').Strategy
var GitHubStrategy = require('passport-github').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var OpenStreetMapStrategy = require('passport-openstreetmap').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var config = require('../config/config')
var compose = require('koa-compose')
var routes = {}

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (id, done) {
  done(null, id)
})

/**
 * Middleware to store a redirectURL in the session for later use
 */
function * storeRedirect (next) {
  if (this.request.query.redirect) {
    this.session.redirect = this.request.query.redirect
  }
  yield next
}

function * doRedirect (next) {
  var redir = this.session.redirect
  if (redir) {
    this.session.redirect = null
    this.redirect(redir)
  } else {
    this.flash = {
      type: 'status',
      msg: "You're logged in!"
    }
    this.redirect('/')
  }
}

// Admin auth if local user and pass were provided
if (config.auth.local.username && config.auth.local.password) {
  passport.use(new DigestStrategy({ qop: 'auth' },
    function (username, done) {
      if (username === config.auth.local.username) {
        // If the correct username is supplied return the user and pass word for verification
        done(null, {name: username, userId: 'local_' + username}, config.auth.local.password)
      } else {
        done(null, false)
      }
    },
    function (params, done) {
      // asynchronous validation, for effect...
      process.nextTick(function () {
        // check nonces in params here, if desired
        return done(null, true)
      })
    }
  ))

  routes.admin = {
    handler: compose([
      storeRedirect,
      passport.authenticate('digest'),
      doRedirect
    ]),
    path: '/admin',
    method: 'get'
  }
}

// GitHub Auth if id and secret were provided
if (config.auth.github.client_id && config.auth.github.client_secret) {
  passport.use(new GitHubStrategy({
    clientID: config.auth.github.client_id,
    clientSecret: config.auth.github.client_secret,
    callbackURL: config.app.baseUrl + config.auth.mount + '/github/callback'
  },
    function (accessToken, refreshToken, profile, done) {
      return done(null, {name: profile.displayName, userId: profile.provider + '_' + profile.id})
    }
  ))

  routes.github = {
    handler: compose([
      storeRedirect,
      passport.authenticate('github', {
        callbackURL: config.app.baseUrl + config.auth.mount + '/github/callback'
      })
    ]),
    path: '/github',
    method: 'get'
  }

  routes.github_callback = {
    handler: compose([
      passport.authenticate('github'),
      doRedirect
    ]),
    path: '/github/callback',
    method: 'get'
  }
}

if (config.auth.twitter.consumerKey && config.auth.twitter.consumerSecret) {
  passport.use(new TwitterStrategy({
    consumerKey: config.auth.twitter.consumerKey,
    consumerSecret: config.auth.twitter.consumerSecret,
    callbackURL: config.app.baseUrl + config.auth.mount + '/twitter/callback'
  },
    function (token, tokenSecret, profile, done) {
      return done(null, {name: profile.displayName, userId: profile.provider + '_' + profile.id})
    }
  ))

  routes.twitter = {
    handler: compose([
      storeRedirect,
      passport.authenticate('twitter', {
        callbackURL: config.app.baseUrl + config.auth.mount + '/twitter/callback'
      })
    ]),
    path: '/twitter',
    method: 'get'
  }

  routes.twitter_callback = {
    handler: compose([
      passport.authenticate('twitter'),
      doRedirect
    ]),
    path: '/twitter/callback',
    method: 'get'
  }
}

if (config.auth.osm.consumerKey && config.auth.osm.consumerSecret) {
  passport.use(new OpenStreetMapStrategy({
    consumerKey: config.auth.osm.consumerKey,
    consumerSecret: config.auth.osm.consumerSecret,
    callbackURL: config.app.baseUrl + config.auth.mount + '/openstreetmap/callback'
  },
    function (token, tokenSecret, profile, done) {
      return done(null, {name: profile.displayName, userId: profile.provider + '_' + profile.id})
    }
  ))

  routes.openstreetmap = {
    handler: compose([
      storeRedirect,
      passport.authenticate('openstreetmap', {
        callbackURL: config.app.baseUrl + config.auth.mount + '/openstreetmap/callback'
      })
    ]),
    path: '/openstreetmap',
    method: 'get'
  }

  routes.openstreetmap_callback = {
    handler: compose([
      passport.authenticate('openstreetmap'),
      doRedirect
    ]),
    path: '/openstreetmap/callback',
    method: 'get'
  }
}

// Facebook Auth if id and secret were provided
if (config.auth.facebook.client_id && config.auth.facebook.client_secret) {
  passport.use(new FacebookStrategy({
    clientID: config.auth.facebook.client_id,
    clientSecret: config.auth.facebook.client_secret,
    callbackURL: config.app.baseUrl + config.auth.mount + '/facebook/callback'
  },
    function (accessToken, refreshToken, profile, done) {
      return done(null, {name: profile.displayName, userId: profile.provider + '_' + profile.id})
    }
  ))

  routes.facebook = {
    handler: compose([
      storeRedirect,
      passport.authenticate('facebook', {
        callbackURL: config.app.baseUrl + config.auth.mount + '/facebook/callback'
      })
    ]),
    path: '/facebook',
    method: 'get'
  }

  routes.facebook_callback = {
    handler: compose([
      passport.authenticate('facebook'),
      doRedirect
    ]),
    path: '/facebook/callback',
    method: 'get'
  }
}

// Google Auth if enabled
if (config.auth.google.consumerKey && config.auth.google.consumerSecret) {
  passport.use(new GoogleStrategy({
    clientID: config.auth.google.consumerKey,
    clientSecret: config.auth.google.consumerSecret,
    callbackURL: config.app.baseUrl + config.auth.mount + '/google/callback'
  },
    function (accessToken, refreshToken, profile, done) {
      return done(null, {name: profile.displayName, userId: profile.provider + '_' + profile.id})
    }
  ))

  routes.google = {
    handler: compose([
      storeRedirect,
      passport.authenticate('google', { scope: [
        'https://www.googleapis.com/auth/userinfo.profile'
      ]})
    ]),
    path: '/google',
    method: 'get'
  }

  routes.google_callback = {
    handler: compose([
      passport.authenticate('google'),
      doRedirect
    ]),
    path: '/google/callback',
    method: 'get'
  }
}

if (config.auth.bearer.token && config.auth.bearer.info) {
  passport.use(new BearerStrategy(
    function (token, done) {
      if (token !== config.auth.bearer.token) {
        return done(null, false)
      }
      var info = JSON.parse(config.auth.bearer.info)
      return done(null, info.user, info.scope)
    }
  ))
}

module.exports.routes = routes
