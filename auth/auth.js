var passport = require('koa-passport'),
    Router = require('koa-router'),
    DigestStrategy = require('passport-http').DigestStrategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GitHubStrategy = require('passport-github').Strategy,
    GoogleStrategy = require('passport-google-oauth').Strategy,
    OpenStreetMapStrategy = require('passport-openstreetmap').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    config = require('../config/config'),
    jwt = require('koa-jwt'),
    compose = require('koa-compose'),
    routes = {},
    tokenResponse;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, user);
});

/**
 * Middleware to build sign and return a JSON Web Token
 */
function *tokenResponse(next){
  var token; 
  if (this.isAuthenticated()) {
    token = jwt.sign(this.req.user, config.jwt.secret);
    if (this.session && this.session.redirect) {
      return this.redirect(this.session.redirect + '?token=' + token);
    }
    this.status = 200;
    this.body = { token: token };
  } else {
    this.throw(401);
  }
}

/**
 * Middleware to store a redirectURL in the session for later use
 */
function *storeRedirect(next){
  if (this.request.query.redirect) {
    this.session.redirect = this.request.query.redirect;
  }
  yield next;
}

// Admin auth if local user and pass were provided
if (config.auth.local.username && config.auth.local.password) {
  passport.use(new DigestStrategy({ qop: 'auth' },
    function(username, done) {
      if (username === config.auth.local.username) {
        // If the correct username is supplied return the user and pass word for verification
        done(null, {name: config.auth.local.username}, config.auth.local.password);
      } else {
        done(null, false);
      }
    },
    function(params, done) {
      // asynchronous validation, for effect...
      process.nextTick(function () {
        // check nonces in params here, if desired
        return done(null, true);
      });
    }
  ));

  routes.admin = {
    handler: compose([
      storeRedirect,
      passport.authenticate('digest', { session: false }),
      tokenResponse
    ]),
    path: '/admin',
    method: 'get'
  };

}

// GitHub Auth if id and secret were provided
if (config.auth.github.client_id && config.auth.github.client_secret) {
  passport.use(new GitHubStrategy({
      clientID: config.auth.github.client_id,
      clientSecret: config.auth.github.client_secret,
      callbackURL: config.app.baseUrl + config.auth.mount + '/github/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, {name: profile.displayName});
    }
  ));

  routes.github = {
    handler: compose([
      storeRedirect,
      passport.authenticate('github', {
        session: false,
        callbackURL:  config.app.baseUrl + config.auth.mount + '/github/callback'
      })
    ]),
    path: '/github',
    method: 'get'
  };

  routes.github_callback = {
    handler: compose([
      passport.authenticate('github', { session: false }),
      tokenResponse
    ]),
    path: '/github/callback',
    method: 'get'
  };
}

if (config.auth.twitter.consumerKey && config.auth.twitter.consumerSecret) {
  passport.use(new TwitterStrategy({
      consumerKey: config.auth.twitter.consumerKey,
      consumerSecret: config.auth.twitter.consumerSecret,
      callbackURL: config.app.baseUrl + config.auth.mount + '/twitter/callback'
    },
    function(token, tokenSecret, profile, done){
      return done(null, {name: profile.displayName});
    }
  ));

  routes.twitter = {
    handler: compose([
      storeRedirect,
      passport.authenticate('twitter', {
        callbackURL:  config.app.baseUrl + config.auth.mount + '/twitter/callback'
      })
    ]),
    path: '/twitter',
    method: 'get'
  };

  routes.twitter_callback = {
    handler: compose([
      passport.authenticate('twitter'),
      tokenResponse
    ]),
    path: '/twitter/callback',
    method: 'get'
  };
}

if (config.auth.osm.consumerKey && config.auth.osm.consumerSecret) {
  passport.use(new OpenStreetMapStrategy({
      consumerKey: config.auth.osm.consumerKey,
      consumerSecret: config.auth.osm.consumerSecret,
      callbackURL: config.app.baseUrl + config.auth.mount + '/openstreetmap/callback'
    },
    function(token, tokenSecret, profile, done){
      return done(null, {name: profile.displayName});
    }
  ));

  routes.openstreetmap = {
    handler: compose([
      storeRedirect,
      passport.authenticate('openstreetmap', {
        callbackURL:  config.app.baseUrl + config.auth.mount + '/openstreetmap/callback'
      })
    ]),
    path: '/openstreetmap',
    method: 'get'
  };

  routes.openstreetmap_callback = {
    handler: compose([
      passport.authenticate('openstreetmap'),
      tokenResponse
    ]),
    path: '/openstreetmap/callback',
    method: 'get'
  };
}

// Facebook Auth if id and secret were provided
if (config.auth.facebook.client_id && config.auth.facebook.client_secret) {
  passport.use(new FacebookStrategy({
      clientID: config.auth.facebook.client_id,
      clientSecret: config.auth.facebook.client_secret,
      callbackURL: config.app.baseUrl + config.auth.mount + '/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, {name: profile.displayName});
    }
  ));

  routes.facebook = {
    handler: compose([
      storeRedirect,
      passport.authenticate('facebook', {
        session: false,
        callbackURL:  config.app.baseUrl + config.auth.mount + '/facebook/callback'
      })
    ]),
    path: '/facebook',
    method: 'get'
  };

  routes.facebook_callback = {
    handler: compose([
      passport.authenticate('facebook', { session: false }),
      tokenResponse
    ]),
    path: '/facebook/callback',
    method: 'get'
  };
}

// Google Auth if enabled
if (config.auth.google.consumerKey && config.auth.google.consumerSecret) {
  passport.use(new GoogleStrategy({
      consumerKey: config.auth.google.consumerKey,
      consumerSecret: config.auth.google.consumerSecret,
      callbackURL: config.app.baseUrl + config.auth.mount + '/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, {name: profile.displayName});
    }
  ));

  routes.google = {
    handler: compose([
      storeRedirect,
      passport.authenticate('google')
    ]),
    path: '/google',
    method: 'get'
  };

  routes.google_callback = {
    handler: compose([
      passport.authenticate('google'),
      tokenResponse
    ]),
    path: '/google/callback',
    method: 'get'
  };
}

module.exports.routes = routes;