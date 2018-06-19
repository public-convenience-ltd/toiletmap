const Loo = require('../../models/loo');
const LooList = require('../../models/loo_list');
const config = require('../../config/config');
const routes = [];

/**
 * Get loos near lon/lat
 * Accepts `radius` in meters in query
 */
routes.push({
  handler: async (req, res) => {
    const maxDistance = req.query.radius || config.query_defaults.maxDistance;
    const limit = req.query.limit || config.query_defaults.limit;
    const loos = await Loo.findNear(
      req.params.lon,
      req.params.lat,
      maxDistance,
      limit
    ).exec();
    res.status(200).json(new LooList(loos));
  },
  path: '/loos/near/:lon/:lat',
  method: 'get',
});

/**
 * GET loos in bounding box
 */
routes.push({
  handler: async (req, res) => {
    const loos = await Loo.findIn(
      req.params.sw,
      req.params.ne,
      req.params.nw,
      req.params.se
    ).exec();
    res.status(200).json(new LooList(loos));
  },
  path: '/loos/in/:sw/:ne/:nw/:se',
  method: 'get',
});

/**
 * GET an array of loo ids
 */
routes.push({
  handler: async (req, res) => {
    const q = {};
    if (req.query.missing) {
      q[req.query.missing] = { $exists: false };
    }
    const loos = await Loo.findIds(q).exec();
    res.status(200).json(new LooList(loos));
  },
  path: '/loos',
  method: 'get',
});

/**
 * Regenerate a loo from its reports
 */
// routes.push({
//   handler: async (req, res) => {
//     const loo = await Loo.findById(req.params.id);
//     const regen = await loo.regenerate();
//     await regen.save();
//     res.status(200).json(regen);
//   },
//   path: '/loos/:id/updateArea',
//   method: 'get',
// });

/**
 * GET a loo by ID
 */
routes.push({
  handler: async (req, res) => {
    const loo = await Loo.findById(this.params.id).exec();
    if (!loo) {
      return res.status(404).end();
    }

    res.status(200).json(loo);
  },
  path: '/loos/:id',
  method: 'get',
});

module.exports = routes;
