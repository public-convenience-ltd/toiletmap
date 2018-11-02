const express = require('express');
const fetch = require('node-fetch');
const _ = require('lodash');
const config = require('../config/config');
const { Loo, Report } = require('../db')(config.mongo.url);
const { checkJwt, checkScopes } = require('../config/auth');

const router = express.Router();
router.use(express.json());

async function getAreaData(point) {
  let url = `${config.mapit.endpoint}${point.coordinates.join(',')}?apiKey=${
    config.mapit.apiKey
  }`;
  let response = await fetch(url);
  if (!response.ok) {
    console.error(
      `Failed to fetch area data from ${url} got response (${
        response.status
      }) ${response.statusText}`
    );
    return undefined;
  }
  let data = await response.json();
  // Mapit returns an object keyed by numerid area id.
  // We are only looking for the values containing a type_name our config
  // tells us is interesting. We'll extract them and map them into an
  let area = _.map(data, v => {
    if (config.mapit.areaTypes.includes(v.type_name)) {
      return {
        type: v.type_name,
        name: v.name,
      };
    }
  });
  return _.compact(area);
}

async function getContributorData(bearerToken) {
  try {
    let reqProfile = await fetch(config.auth0.userinfoUrl, {
      headers: {
        Authorization: bearerToken,
      },
    });
    return await reqProfile.json();
  } catch (error) {
    throw error;
  }
}

async function save(data, token) {
  const profile = await getContributorData(token);
  const area = await getAreaData(data.geometry);

  const report = {
    ...data,
    properties: {
      ...data.properties,
      area,
    },
    userId: profile.sub,
    contributor: profile.nickname || config.reports.anonContributor,
    trust: config.reports.trust,
    collectionMethod: 'api',
  };

  const validator = new Report(report);

  try {
    await validator.validate();
  } catch (e) {
    throw e;
  }
  return await Report.processReport(report);
}

router.post('/', checkJwt, checkScopes('report:loo'), async (req, res) => {
  let persist;
  try {
    persist = await save(req.body, req.get('Authorization'));
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

router.delete('/:id', checkJwt, checkScopes('report:loo'), async (req, res) => {
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

  try {
    await save(report, req.get('Authorization'));
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send(_.map(error.errors, 'message').join('\n'));
    }
    console.error(error);
    return res.sendStatus(500);
  }
  res.sendStatus(200);
});

/**
 * GET report by id
 */
router.get('/:id', async (req, res) => {
  const id = req.params.id.replace('.json', '');
  const report = await Report.findById(id).exec();
  if (!report) {
    return res.status(404).end();
  }
  res.status(200).json(report);
});

module.exports = router;
