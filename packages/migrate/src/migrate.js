const _ = require('lodash');
const { Report, db } = require('@neontribe/gbptm-loodb')(
  'mongodb://localhost:27017/gbptm'
);

/**
 * Gets any useful textual information from a string or undefined if there is
 * none.
 */
function ignoreEmpty(string) {
  if (string === undefined) {
    return undefined;
  }

  if (string.trim().length === 0) {
    // only whitespace, the field was likely intended to be removed
    return null;
  }

  return string.trim();
}

/**
 * Maps string values to bools and ensures that 'Not Known' is unset.
 */
function mapTriState(state) {
  if (state === 'true') {
    return true;
  }
  if (state === 'false') {
    return false;
  }
  if (state === 'Not Known') {
    return null;
  }
  return state;
}

/**
 * Convert a legacy report to the new report schema.
 */
exports.toNewReport = function toNewReport(legacy) {
  return new Report({
    diff: _.pickBy(
      {
        geometry: legacy.geometry,
        name: ignoreEmpty(legacy.properties.name),
        active: legacy.properties.active,
        access: ignoreEmpty(legacy.properties.access),
        opening: ignoreEmpty(legacy.properties.opening),
        type: ignoreEmpty(legacy.properties.type),
        accessibleType: ignoreEmpty(legacy.properties.accessibleType),
        babyChange: mapTriState(legacy.properties.babyChange),
        radar: mapTriState(legacy.properties.radar),
        attended: mapTriState(legacy.properties.attended),
        automatic: mapTriState(legacy.properties.automatic),
        fee: ignoreEmpty(legacy.properties.fee),
        notes: ignoreEmpty(legacy.properties.notes),
        removalReason: ignoreEmpty(legacy.properties.removal_reason),
        area: legacy.properties.area.map(area =>
          _.omit(area.toObject(), ['_id'])
        ),
      },
      value => value !== undefined
    ),
  });
};

/**
 * Convert a list of legacy reports to a list of new reports, chaining them
 * together into a linked list in the process.
 */
exports.toNewReports = async function toNewReports(legacies) {
  // create a new report based on a legacy report, with no knowledge of others
  const newReps = legacies.map(exports.toNewReport);
  await Promise.all(newReps.map(rep => rep.save()));

  // add references to prior loos and remove redundant data
  for (let i = 1; i < newReps.length; i++) {
    await newReps[i].deriveFrom(newReps[i - 1]);
    await newReps[i].save();
  }

  // add reference to following loos
  for (var i = 0; i + 1 < newReps.length; i++) {
    newReps[i].nameSuccessor(newReps[i + 1]);
    await newReps[i].save();
  }

  return newReps;
};

exports.toNewLoos = async function toNewLoos() {
  // Find all reports that start a list.
  const tailReports = await Report.find({
    previous: { $exists: false },
  }).exec();
  const newLoos = [];
  for (const report of tailReports) {
    let root = report;
    // Traverse each linked report list to find the root report.
    while (root.next) {
      await root.populate('next').execPopulate();
      root = root.next;
    }
    // Generate a loo from each root report and save it.
    const newLoo = await root.generateLoo();
    newLoos.push(newLoo);
    newLoo.save();
  }
  return newLoos;
};

/**
 * Export the db connection instance.
 */
exports.db = db;
