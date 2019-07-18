const express = require('express');
const router = express.Router();
const config = require('../config');
const { Loo } = require('../db')(config.mongo.url);

const geojsonify = ({ distance, _id, properties }) => {
  let { geometry, ...props } = properties;
  return {
    type: 'Feature',
    geometry,
    _id,
    distance,
    properties: {
      ...props,
    },
  };
};

/**
 * Get loos near lon/lat
 * Legacy GeoJSON format
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

  const geojson = {
    type: 'FeatureCollection',
    features: loos.map(geojsonify),
  };

  res.status(200).json(geojson);
});

/**
 * Get loos near lon/lat
 * Accepts `radius` in meters in query
 */
router.get('/v2/near/:lon/:lat', async (req, res) => {
  const wantedRadius =
    parseFloat(req.query.radius) || config.query_defaults.defaultRadius;
  const allowedRadius = Math.min(wantedRadius, config.query_defaults.maxRadius);
  const loos = await Loo.findNear(
    parseFloat(req.params.lon),
    parseFloat(req.params.lat),
    allowedRadius
  ).exec();

  res.status(200).json(loos);
});

/**
 * GET an array of points
 */
router.get('/', async (req, res) => {
  const loos = await Loo.find({}, 'type geometry').exec();
  res.status(200).json(loos);
});

/**
 * GET a loo by ID
 * Legacy GeoJSON format
 */
router.get('/:id', async (req, res) => {
  const loo = await Loo.findById(req.params.id).exec();
  if (!loo) {
    return res.status(404).end();
  }

  if (req.query.populateReports) {
    const populatedReportsLoo = await loo.populate('reports').execPopulate();
    res.status(200).json(populatedReportsLoo);
    return;
  }

  res.status(200).json(geojsonify(loo));
});

/**
 * GET a loo by ID
 */
router.get('/v2/:id', async (req, res) => {
  const loo = await Loo.findById(req.params.id).exec();
  if (!loo) {
    return res.status(404).end();
  }

  if (req.query.populateReports) {
    const populatedReportsLoo = await loo.populate('reports').execPopulate();
    res.status(200).json(populatedReportsLoo);
    return;
  }

  res.status(200).json(loo);
});

module.exports = router;
