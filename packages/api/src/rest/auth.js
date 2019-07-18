const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const config = require('../config').auth0;

/**
 * Express middleware to validate a jwt.
 * Does res.sendStatus(401) if it doesn't check out
 */
const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.jwksUri,
  }),

  // Validate the audience and the issuer.
  audience: config.audience,
  issuer: config.issuer,
  algorithms: config.algorithms,
});

/**
 * Creates middleware to check for a specific scope/scopes
 * Use it AFTER checkJwt
 * Does res.sendStatus(401) if it doesn't check out
 */
const checkScopes = (...scopes) => jwtAuthz(scopes);

module.exports = {
  checkJwt,
  checkScopes,
};
