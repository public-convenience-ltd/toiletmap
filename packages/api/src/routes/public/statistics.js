const express = require('express');
const router = express.Router();
const Loo = require('../../models/loo');
const LooReport = require('../../models/loo_report');
const _ = require('lodash');
const { DateTime } = require('luxon');

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

router.get('/counters', async (req, res) => {
  const qWithInactive = _.merge({ includeInactive: true }, req.query);
  const [
    activeLoos,
    loosCount,
    looReports,
    uiReports,
    removals,
    multiReportLoos,
  ] = await Promise.all([
    Loo.count(scopeQuery({}, req.query)).exec(),
    Loo.count(scopeQuery({}, qWithInactive)).exec(),
    LooReport.count(scopeQuery({}, qWithInactive)).exec(),
    LooReport.count(
      scopeQuery({ collectionMethod: 'api' }, qWithInactive)
    ).exec(),
    LooReport.count(
      scopeQuery(
        { 'properties.removal_reason': { $exists: true } },
        qWithInactive
      )
    ).exec(),
    Loo.count(
      scopeQuery({ 'reports.1': { $exists: true } }, qWithInactive)
    ).exec(),
  ]);
  const importedReports = looReports - uiReports;
  const inactiveLoos = loosCount - activeLoos;

  res.status(200).json({
    'Total Toilets Added': loosCount,
    'Active Toilets Added': activeLoos,
    'Inactive/Removed Toilets': inactiveLoos,
    'Total Loo Reports Recorded': looReports,
    'Total Reports via Web UI/API': uiReports,
    'Reports from Data Collections': importedReports,
    'Removal Reports Submitted': removals,
    'Loos with Multiple Reports': multiReportLoos,
  });
});

router.get('/proportions', async (req, res) => {
  const [
    publicLoos,
    unknownAccessLoos,
    babyChange,
    babyChangeUnknown,
    activeLoos,
    inaccessibleLoos,
    accessibleLoosUnknown,
    loosCount,
    inactiveLoos,
  ] = await Promise.all([
    Loo.count(scopeQuery({ 'properties.access': 'public' }, req.query)).exec(),
    Loo.count(scopeQuery({ 'properties.access': 'none' }, req.query)).exec(),
    Loo.count(
      scopeQuery({ 'properties.babyChange': 'true' }, req.query)
    ).exec(),
    Loo.count(
      scopeQuery({ 'properties.babyChange': 'Not Known' }, req.query)
    ).exec(),
    Loo.count(scopeQuery({}, req.query)).exec(),
    Loo.count(
      scopeQuery(
        {
          'properties.accessibleType': 'none',
        },
        req.query
      )
    ).exec(),
    Loo.count(
      scopeQuery(
        {
          'properties.accessibleType': { $exists: false },
        },
        req.query
      )
    ).exec(),
    Loo.count(scopeQuery({}, req.query)).exec(),
    Loo.count(scopeQuery({}, _.merge({ includeInactive: true }, req.query))),
  ]);

  res.status(200).json({
    'Active Loos': [activeLoos, inactiveLoos - activeLoos, 0],
    'Public Loos': [
      publicLoos,
      loosCount - (publicLoos + unknownAccessLoos),
      unknownAccessLoos,
    ],
    'Baby Changing': [
      babyChange,
      loosCount - (babyChange + babyChangeUnknown),
      babyChangeUnknown,
    ],
    'Accessible Loos': [
      loosCount - (inaccessibleLoos + accessibleLoosUnknown),
      inaccessibleLoos,
      accessibleLoosUnknown,
    ],
  });
});

router.get('/contributors', async (req, res) => {
  const scope = scopeQuery({}, req.query);
  scope.$and.push({ type: 'Feature' });
  const contributors = await LooReport.aggregate([
    {
      $match: scope,
    },
    {
      $group: {
        _id: '$attribution',
        reports: {
          $sum: 1,
        },
      },
    },
  ]).exec();

  res.status(200).json(
    _.transform(
      contributors,
      function(acc, val) {
        acc[val._id] = val.reports;
      },
      {}
    )
  );
});

router.get('/statistics/areas', async (req, res) => {
  const scope = scopeQuery({}, _.merge({ includeInactive: true }, req.query));
  const areas = await Loo.aggregate([
    {
      $match: scope,
    },
    {
      $unwind: '$properties.area',
    },
    {
      $project: {
        areaType: {
          $cond: [
            '$properties.area.type',
            '$properties.area.type',
            'Unknown Type',
          ],
        },
        areaName: {
          $cond: [
            '$properties.area.name',
            '$properties.area.name',
            'Unknown Area',
          ],
        },
        active: {
          $cond: ['$properties.active', 1, 0],
        },
        public: {
          $cond: [
            {
              $eq: ['$properties.access', 'public'],
            },
            1,
            0,
          ],
        },
        permissive: {
          $cond: [
            {
              $eq: ['$properties.access', 'permissive'],
            },
            1,
            0,
          ],
        },
        babyChange: {
          $cond: [
            {
              $and: [
                { $eq: ['$properties.babyChange', 'true'] },
                { $eq: ['$properties.active', true] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$areaName',
        looCount: {
          $sum: 1,
        },
        activeLooCount: {
          $sum: '$active',
        },
        publicLooCount: {
          $sum: '$public',
        },
        permissiveLooCount: {
          $sum: '$permissive',
        },
        babyChangeCount: {
          $sum: '$babyChange',
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]).exec();

  res.status(200).json(areas);
});

module.exports = router;
