#!/usr/bin/env node

/* eslint no-loop-func: "off" */

const config = require('./config.json');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { connect, Area, Loo } = require('../../../db/');
const cliProgress = require('cli-progress');

const bar = new cliProgress.SingleBar({
  stopOnComplete: true,
  etaBuffer: 30,
});

/**
 * Loads a json file/url which doesn't necessarily have .json as a file extension.
 */
function loadJSON(src, log) {
  return new Promise((resolve) => {
    if (!src.remote) {
      // Local file
      fs.readFile(src.url, 'utf-8', (error, res) => {
        if (error) {
          log(`Error reading file: ${error.message}`);
          return resolve(false);
        }
        const geo = JSON.parse(res);
        return resolve(geo);
      });
    } else {
      // Internet resource
      const url = new URL(src.url);
      let moduleToUse;
      if (url.protocol === 'https:') {
        moduleToUse = https;
      } else if (url.protocol === 'http:') {
        moduleToUse = http;
      } else {
        log(`Unrecognised protocol '${url.protocol}'`);
        return resolve(false);
      }

      moduleToUse.get(url, (res) => {
        if (res.statusCode !== 200) {
          log(`Response failed: code ${res.statusCode} recieved`);
          return resolve(false);
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const geo = JSON.parse(rawData);
            resolve(geo);
          } catch (e) {
            log(`Error parsing response body: ${e.message}`);
            resolve(false);
          }
        });
      });
    }
  });
}

/**
 * Do any cleanup and exit the programme.
 */
function finish() {
  console.log('Exiting...');
  process.exit(0);
}

/**
 * Mmmm, curry.
 */
function datasetLogger(dataset) {
  return (...args) => {
    console.log(`${dataset.id}:`, ...args);
  };
}

/**
 * Update the database from a dataset-format object.
 */
async function updateDataset(dataset, dryrun) {
  const log = datasetLogger(dataset);

  log(`Loading GeoJSON file ${dataset.src.url}...`);
  const bounds = await loadJSON(dataset.src, log);
  if (!bounds) {
    log('Abort dataset update');
    return false;
  }
  log(`Loaded: ${bounds.name}`);

  // Do some preliminary checks
  if (dryrun) {
    log(
      `Would delete old areas with id==${dataset.id}, version!=${dataset.version}`
    );
  } else {
    log('Searching for non-stale area data in database...');
    const nonStale = await new Promise((resolve) => {
      Area.findOne(
        {
          version: dataset.version,
          datasetId: dataset.id,
        },
        (err, res) => {
          return resolve(res);
        }
      );
    });

    if (nonStale != null) {
      log(
        `WARNING: Type ${dataset.type} has non-stale entries in the database. This means you probably need to increment the version number. Not changing anything for this dataset.`
      );
      return false;
    }

    // Get rid of stale data i.e. areas which have the same datasetId but a different version number
    log('Deleting stale data...');
    await new Promise((resolve) =>
      Area.deleteMany(
        {
          datasetId: dataset.id,
        },
        (err, res) => {
          if (err) {
            log('Error deleting:', err);
            return false;
          }
          return resolve();
        }
      )
    );
    log('Deleted successfully, now writing new area data...');
  }

  // Actually write the new areas to the database
  let count = bounds.features.length;
  let saved = 0;
  bar.start(count, 0);
  const res = await new Promise((resolve) => {
    if (bounds.features[0].properties[dataset.areaNameField] === undefined) {
      bar.stop();
      log(
        `WARNING: Area name field ${dataset.areaNameField} does not exist in dataset! Skipping...`
      );
      return resolve(false);
    }
    for (let feature of bounds.features) {
      const name = feature.properties[dataset.areaNameField];
      const geometry = feature.geometry;

      const newArea = new Area();
      newArea.name = name;
      newArea.geometry = geometry;
      newArea.datasetId = dataset.id;
      newArea.priority = dataset.priority;
      newArea.version = dataset.version;
      newArea.type = dataset.type;

      if (dryrun) {
        log(`Would save area ${name}`);
      } else {
        newArea.save((err) => {
          if (err) {
            console.error(`${dataset.id}: Error saving area: ${err}`);
            return resolve(false);
          }
          saved += 1;
          bar.update(saved);
          if (saved === count) {
            log('Successfully written new areas for this dataset');
            bar.stop();
            return resolve(true);
          }
        });
      }
    }
  });
  return res;
}

/**
 * Update loos to be within new areas
 */
async function updateLoos(dryrun) {
  if (dryrun) {
    console.log('Would update loos with new areas');
    return true;
  }

  console.log('Updating loos with new areas...');
  const loos = await Loo.find({}).exec();

  const total = loos.length;
  let saved = 0;
  bar.start(total, 0);
  for (const loo of loos) {
    let areas = await Area.containing(loo.properties.geometry.coordinates);
    if (areas.length === 0) {
      areas = [
        {
          name: 'Unknown area',
          type: 'Unknown',
        },
      ];
    }

    loo.properties.area = areas;
    await loo.save((err) => {
      if (err) {
        console.error(`Error updating loo: ${err.message}`);
      }
    });
    bar.update(++saved);
  }

  bar.stop();
  console.log(`${saved} loos updated`);
  return true;
}

/**
 * Make sure the configuration is valid
 */
function sanityCheck(datasets) {
  const ids = [];

  datasets.forEach((dataset) => {
    if (ids.includes(dataset.id)) {
      console.log(
        'Config is insane! You cannot have two datasets with the same id.'
      );
      return false;
    }
    ids.push(dataset.id);
  });
  return true;
}

/**
 * Entry point.
 */
async function run() {
  const args = process.argv.slice(2);
  const dryrun = args.includes('--dry-run') || args.includes('-n');

  if (!sanityCheck(config.datasets)) {
    console.log('Sanity check failed');
    return finish();
  }

  if (!dryrun) {
    connect(process.env.MONGODB_URI);
  }

  let count = config.datasets.length;
  let saved = 0;
  let success = 0;
  await new Promise((doneAreas) => {
    config.datasets.forEach(async (dataset) => {
      const res = await updateDataset(dataset, dryrun);
      saved += 1;
      success += res ? 1 : 0;
      if (saved === count) {
        console.log(`Saved all saveable areas, ${success} successes`);
        return doneAreas();
      }
    });
  });

  await updateLoos(dryrun);

  if (dryrun) {
    console.log(`Would have added ${count} areas`);
  }

  finish();
}

run();
