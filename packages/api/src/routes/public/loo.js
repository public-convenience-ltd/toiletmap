const express = require('express');
const router = express.Router();
const Loo = require('../../models/loo');
const LooList = require('../../models/loo_list');
const config = require('../../config/config');

/**
 * Get loos near lon/lat
 * Accepts `radius` in meters in query
 */
router.get('/near/:lon/:lat', async (req, res) => {
  const maxDistance =
    parseFloat(req.query.radius) || config.query_defaults.maxDistance;
  const limit = parseFloat(req.query.limit) || config.query_defaults.limit;
  const loos = await Loo.findNear(
    parseFloat(req.params.lon),
    parseFloat(req.params.lat),
    maxDistance,
    limit
  ).exec();
  res.status(200).json(new LooList(loos));
});

/**
 * GET loos in bounding box
 */
router.get('/in/:sw/:ne/:nw/:se', async (req, res) => {
  const loos = await Loo.findIn(
    req.params.sw.split(',').map(parseFloat),
    req.params.ne.split(',').map(parseFloat),
    req.params.nw.split(',').map(parseFloat),
    req.params.se.split(',').map(parseFloat)
  ).exec();
  res.status(200).json(new LooList(loos));
});

/**
 * GET an array of loo ids
 */
router.get('/', async (req, res) => {
  const q = {};
  if (req.query.missing) {
    q[req.query.missing] = { $exists: false };
  }
  const loos = await Loo.findIds(q).exec();
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
