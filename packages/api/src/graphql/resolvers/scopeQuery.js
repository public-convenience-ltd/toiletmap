const { DateTime } = require('luxon');

/*
  Scopes a `query` based on the `options` passed to it

  Options can be:
    - start: ISO formatted datetime string, default 2009-01-01
    - end: ISO formatted datetime string, default now
    - area: string, default 'All'
    - areaType: string, default 'All'
    - includeInactive: bool, default false
*/
function scopeQuery(query, options) {
  var start = options.start
    ? DateTime.fromISO(options.start)
    : DateTime.fromISO('2009-01-01');
  var end = options.end ? DateTime.fromISO(options.end) : DateTime.local();
  var area = options.area || 'All';
  var areaType = options.areaType || 'All';
  var includeInactive = options.includeInactive || false;
  query['$and'] = [
    {
      createdAt: {
        $gte: start.toJSDate(),
      },
    },
    {
      createdAt: {
        $lte: end.toJSDate(),
      },
    },
  ];

  if (!includeInactive) {
    query.$and.push({ 'properties.active': true });
  }

  if (areaType !== 'All') {
    query.$and.push({ 'properties.area.type': areaType });
  }

  if (area !== 'All') {
    query.$and.push({ 'properties.area.name': area });
  }

  return query;
}

module.exports = scopeQuery;
