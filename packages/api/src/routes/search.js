const express = require('express');
const router = express.Router();
const config = require('../config/config');
const { Loo } = require('@neontribe/gbptm-loodb')(config.mongo.url);

const _ = require('lodash');

router.get('/', async (req, res) => {
  const params = Object.assign({}, req.query);
  const query = {};
  // Strip out the pagination we use
  const limit = parseInt(params.limit) || 10;
  const page = parseInt(params.page) || 1;
  delete params.limit;
  delete params.page;

  const order = params.order || 'desc';

  if (params.text) {
    query.$or = [{ $text: { $search: params.text } }];
  }

  // Note: from_date is the precondition for using the to_date.
  if (params.from_date) {
    query.updatedAt = {
      $gte: params.from_date,
    };
    if (params.to_date) {
      query.updatedAt.$lte = params.to_date;
    }
  }

  if (params.contributors) {
    query.$and = [];
    query.$and.push({
      contributors: { $all: [params.contributors] },
    });
  }

  // Delete handled keys.
  delete params.text;
  delete params.order;
  delete params.to_date;
  delete params.from_date;
  delete params.contributors;

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

  const loos = await Loo.paginate(query, {
    page: page,
    limit: limit,
    sort: {
      updatedAt: order,
    },
  });
  res.status(200).json(loos);
});

module.exports = router;
