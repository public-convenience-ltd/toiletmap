const express = require('express');
const fetch = require('node-fetch');
const _ = require('lodash');
const config = require('../config');
const { Loo, Report } = require('../db')(config.mongo.url);
const { checkJwt, checkScopes } = require('./auth');

const router = express.Router();
router.use(express.json());

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

router.post('/', checkJwt, checkScopes('report:loo'), async (req, res) => {
  let persist;
  try {
    let user = await getContributorData(req.get('Authorization'));
    let { report: data, from } = req.body;
    persist = await Report.submit(data, user, from);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).send(_.map(error.errors, 'message').join('\n'));
    }
    console.error(error);
    return res.sendStatus(500);
  }
  res.set('Location', `${req.baseUrl}/reports/${persist[0]._id}`);
  res.set('Content-Location', `${req.baseUrl}/loos/${persist[1]._id}`);
  res.status(201);
  res.send({
    report: persist[0]._id,
    loo: persist[1]._id,
  });
});

router.delete('/:id', checkJwt, checkScopes('report:loo'), async (req, res) => {
  const loo = await Loo.findById(req.params.id);
  const payload = {
    from: req.params.id,
    report: {
      active: false,
      access: 'none',
      removal_reason: req.body.removal_reason,
      geometry: loo.properties.geometry,
    },
  };

  try {
    let user = await getContributorData(req.get('Authorization'));
    let { report: data, from } = payload;
    await Report.submit(data, user, from);
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
  const report = await Report.findById(id);
  if (!report) {
    return res.status(404).end();
  }
  res.status(200).json(report);
});

module.exports = router;
