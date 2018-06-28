const express = require('express');
const router = express.Router();

const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

const fetch = require('node-fetch');

const LooReport = require('../../models/loo_report');
const Loo = require('../../models/loo');
const config = require('../../config/config');
const _ = require('lodash');

const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://gbptm.eu.auth0.com/.well-known/jwks.json',
  }),

  // Validate the audience and the issuer.
  audience: 'https://gbptm-unity.herokuapp.com/api',
  issuer: 'https://gbptm.eu.auth0.com/',
  algorithms: ['RS256'],
});

const checkScopes = jwtAuthz(['report:loo']);

async function save(data, userId, attribution = 'GBPTM Contributor') {
  const report = {
    ...data,
    userId,
    attribution,
    trust: config.reports.trust,
    collectionMethod: 'api',
  };

  const validator = new LooReport(report);

  try {
    await validator.validate();
  } catch (e) {
    throw e;
  }
  const result = await LooReport.processReport(report);
  return result;
}

router.use(express.json());
router.post('/reports', checkJwt, checkScopes, async (req, res) => {
  let profile;
  try {
    let reqProfile = await fetch('https://gbptm.eu.auth0.com/userinfo', {
      headers: {
        Authorization: req.get('Authorization'),
      },
    });
    profile = await reqProfile.json();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }

  let persist;
  try {
    persist = await save(req.body, profile.sub, profile.nickname);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send(_.map(error.errors, 'message').join('\n'));
    }
    console.error(error);
    return res.sendStatus(500);
  }
  res.set('Location', `${req.baseUrl}/report/${persist[0]._id}`);
  res.set('Content-Location', `${req.baseUrl}/loo/${persist[1]._id}`);
  res.status(201);
  res.send({
    report: persist[0]._id,
    loo: persist[1]._id,
  });
});

router.post('/remove/:id', checkJwt, checkScopes, async (req, res) => {
  const loo = await Loo.findById(req.params.id).exec();
  const looData = loo.toObject();
  const report = {
    type: looData.type,
    geometry: looData.geometry,
    properties: {
      active: false,
      access: 'none',
      removal_reason: req.body.removal_reason,
    },
  };
  let profile;
  try {
    let reqProfile = await fetch('https://gbptm.eu.auth0.com/userinfo', {
      headers: {
        Authorization: req.get('Authorization'),
      },
    });
    profile = await reqProfile.json();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }

  try {
    await save(report, profile.sub, profile.nickname);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send(_.map(error.errors, 'message').join('\n'));
    }
    console.error(error);
    return res.sendStatus(500);
  }
  res.sendStatus(200);
});

module.exports = router;
