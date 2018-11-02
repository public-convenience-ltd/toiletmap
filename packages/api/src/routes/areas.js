const express = require('express');
const router = express.Router();
const config = require('../config/config');
const { Loo } = require('@neontribe/gbptm-loodb')(config.mongo.url);
const _ = require('lodash');

router.get('/areas', async (req, res) => {
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
});

module.exports = router;
