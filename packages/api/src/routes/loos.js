const express = require('express');
const router = express.Router();
const Loo = require('../models/loo');
const LooList = require('../models/loo_list');
const config = require('../config/config');

/**
 * Get loos near lon/lat
 * Accepts `radius` in meters in query
 */
router.get('/near/:lon/:lat', async (req, res) => {
  const wantedRadius =
    parseFloat(req.query.radius) || config.query_defaults.defaultRadius;
  const allowedRadius = Math.min(wantedRadius, config.query_defaults.maxRadius);
  const loos = await Loo.findNear(
    parseFloat(req.params.lon),
    parseFloat(req.params.lat),
    allowedRadius
  ).exec();
  res.status(200).json(new LooList(loos));
});

/**
 * GET an array of points
 */
router.get('/', async (req, res) => {
  const loos = await Loo.find({}, 'type geometry').exec();
  res.status(200).json(new LooList(loos));
});

/**
 * Regenerate a loo from its reports
 * this'll update it's admin geo
 */
router.get('/:id/updateArea', async (req, res) => {
  const loo = await Loo.findById(req.params.id);
  const regen = await loo.regenerate();
  await regen.save();
  res.status(200).json(regen);
});

/**
 * GET a loo by ID
 */
router.get('/:id', async (req, res) => {
  const loo = await Loo.findById(req.params.id).exec();
  if (!loo) {
    return res.status(404).end();
  }

  res.status(200).json(loo);
});

module.exports = router;
