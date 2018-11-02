const geolib = require('geolib');
const uuid = require('uuid/v4');
const _ = require('lodash');
const fs = require('fs');
const process = require('process');

const twodeetree = require('./2dtree');
const geo = require('./geo');

const DEDUPE_RADIUS = 25;

if (process.argv.length <= 2) {
  // eslint-disable-next-line no-console
  console.error('Usage: yarn start <report json file>');
  process.exit(1);
}

const reports = JSON.parse(fs.readFileSync(process.argv[2]));

function demongoify(report) {
  let properties = {
    ..._.omit(
      report.properties,
      'area',
      'orig',
      'geocoded',
      'geocoding_method'
    ),
  };
  properties = _.pickBy(properties, v => v !== '' && v !== undefined);
  return {
    id: report._id.$oid,
    contributor: report.contributor,
    created: report.createdAt ? report.createdAt.$date : null,
    updated: report.updatedAt ? report.updatedAt.$date : null,
    type: report.type,
    geometry: { ...report.geometry },
    properties,
    trust: report.trust,
  };
}

function consolidateReports(reports) {
  let reps = reports.map(r => dataByUUID[r]);
  /**
   * Sort by date desc then by trust desc
   * merge down the properties
   * get the center of the array of points
   * construct contributors
   */
  reps = _.sortBy(_.compact(reps), ['updated', 'created', 'trust']);
  let center = geolib.getCenter(
    _.map(reps, rep => ({
      latitude: rep.geometry.coordinates[1],
      longitude: rep.geometry.coordinates[0],
    }))
  );
  const loo = {
    licence:
      'http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
    contributor: '© Great British Public Toilet Map, 2018',
    contributors: _.uniq(
      ['Great British Public Toilet Map'].concat(_.map(reps, 'contributor'))
    ),
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(center.longitude), parseFloat(center.latitude)],
    },
    // created: _.min(_.map(reps, 'created')),
    // updated: _.max(_.map(reps, 'updated')),
    properties: _.merge({}, ..._.map(reps, 'properties')),
  };

  return loo;
}

const dataByUUID = reports.reduce((acc, val) => {
  if (val.geometry.coordinates[0]) {
    acc[uuid()] = demongoify(val);
  } else {
    // There are four reports with no coordinates :-(
    //console.error(val);
    //process.exit(1);
  }
  return acc;
}, {});

// eslint-disable-next-line no-console
console.log(`${Object.keys(dataByUUID).length} reports in set`);

const locations = new Set(
  _.map(dataByUUID, (o, k) => ({
    value: k,
    x: o.geometry.coordinates[0], // longitude
    y: o.geometry.coordinates[1], // latitude
  }))
);

let tree = twodeetree.buildTree(Array.from(locations));

const loos = [];
const used = new Set();
for (let value of locations) {
  if (used.has(value.value)) {
    continue;
  }

  used.add(value.value);

  const cautiousBounds = geo.getCoordBounds(value.x, value.y, DEDUPE_RADIUS);
  let inBounds = [];
  for (let nonWrappingBounds of geo.removeBoundWrapAround(cautiousBounds)) {
    inBounds = inBounds.concat(
      twodeetree.findInRange(
        tree,
        nonWrappingBounds.min.lng,
        nonWrappingBounds.min.lat,
        nonWrappingBounds.max.lng,
        nonWrappingBounds.max.lat
      )
    );
  }

  const thisGeo = {
    uid: value.value,
    longitude: value.x,
    latitude: value.y,
  };

  let nearby = inBounds.filter(loc => {
    const thatGeo = {
      uid: loc.value,
      longitude: loc.x,
      latitude: loc.y,
    };

    return geolib.getDistance(thisGeo, thatGeo, 1, 1) < DEDUPE_RADIUS;
  });

  nearby = nearby.filter(loc => {
    return !used.has(loc.value);
  });

  nearby.forEach(n => {
    used.add(n.value);
  });

  const reportIds = [value.value, ...nearby.map(n => n.value)];
  loos.push(consolidateReports(reportIds));
}

// eslint-disable-next-line no-console
console.log(`${loos.length} loos extracted`);

// eslint-disable-next-line no-console
console.log('Applying post filtering (remove closed and non-permissive loos)');
let filtered = _.filter(loos, l => l.properties.active);
filtered = _.filter(filtered, l => l.properties.access !== 'private');
// filtered =  _.filter(filtered, l => l.properties.access === 'permissive');
let out = {
  type: 'FeatureCollection',
  licence:
    'http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
  contributor: '© Great British Public Toilet Map, 2018',
  created: new Date().toISOString(),
  features: filtered,
};

// eslint-disable-next-line no-console
console.log(`${out.features.length} loos passed filtration`);

fs.writeFileSync('./output.json', JSON.stringify(out, null, '\t'));

process.exit(0);
