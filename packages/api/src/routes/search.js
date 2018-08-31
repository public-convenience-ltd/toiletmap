const express = require('express');
const router = express.Router();
const Loo = require('../models/loo');
const _ = require('lodash');

router.get('/', async (req, res) => {
  const params = Object.assign({}, req.query);
  const query = {};
  // Strip out the pagination we use
  const limit = parseInt(params.limit) || 10;
  const page = parseInt(params.page) || 1;
  delete params.limit;
  delete params.page;

  if (params.text) {
    query.$or = [{ $text: { $search: req.query.text } }];
  }
  delete params.text;

  if (params.attributions) {
    query.$and = [];
    query.$and.push({
      attributions: { $all: [params.attributions] },
    });
  }
  delete params.attributions;

  // Arbitrary text searches have been removed until a way is found that is not
  // prone to ReDoS attacks or indexing every possible property by text

  // Handle queries for missing fields
  _.each(params, function(val, name) {
    query.$and = query.$and || [];
    if (/^emptylist_/.test(name)) {
      query.$and.push({
        ['properties.' + name.replace('emptylist_', '')]: { $size: 0 },
      });
      delete params[name];
    }
  });

  // Handle all remaining params
  _.each(params, function(val, name) {
    query.$and = query.$and || [];
    query.$and.push({
      ['properties.' + name.replace('_', '.')]: val,
    });
    delete params[name];
  });

  const loos = await Loo.paginate(query, { page: page, limit: limit });

  res.status(200).json(loos);
});

module.exports = router;
