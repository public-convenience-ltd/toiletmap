const Loo = require('../../models/loo');
const _ = require('lodash');
const routes = [];

routes.push({
  handler: async (req, res) => {
    const params = Object.assign({}, req.query);
    const query = {};
    // Strip out the pagination we use
    const limit = params.limit || 10;
    const page = params.page || 1;
    delete params.limit;
    delete params.page;

    if (params.text) {
      query.$or = [
        { 'properties.name': new RegExp('.*' + req.query.text + '.*', 'i') },
        { 'properties.notes': new RegExp('.*' + req.query.text + '.*', 'i') },
      ];
    }
    delete params.text;

    // Handle text searches
    _.each(params, function(val, name) {
      query.$and = query.$and || [];
      if (/^text_/.test(name)) {
        query.$and.push({
          ['properties.' + name.replace('text_', '')]: new RegExp(
            '.*' + val + '.*',
            'i'
          ),
        });
        delete params[name];
      }
    });

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
  },
  path: '/search',
  method: 'get',
});

module.exports = routes;
