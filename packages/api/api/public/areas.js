const Loo = require('../../models/loo');
const _ = require('lodash');
const routes = [];

routes.push({
  handler: async (req, res) => {
    // gets list of area lists
    const data = await Loo.aggregate([
      {
        $match: { 'properties.area': { $exists: true } },
      },
      {
        $unwind: '$properties.area',
      },
      {
        $group: {
          _id: '$properties.area.type',
          areaNames: {
            $addToSet: '$properties.area.name',
          },
        },
      },
    ]);
    const result = _.reduce(
      data,
      function(acc, d) {
        acc[d._id] = d.areaNames;
        return acc;
      },
      {}
    );
    res.status(200).json(result);
  },
  path: '/admin_geo/areas',
  method: 'get',
});

module.exports = routes;
