const _ = require('lodash');
const { Report } = require('./models');

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
        babyChange: legacy.properties.babyChange,
        radar: legacy.properties.radar,
        attended: legacy.properties.attended,
        automatic: legacy.properties.automatic,
        fee: ignoreEmpty(legacy.properties.fee),
        notes: ignoreEmpty(legacy.properties.notes),
        removal_reason: ignoreEmpty(legacy.properties.removal_reason),
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

  // iterate through chain of reports
  const core = {};
  for (let i = 0; i < newReps.length; i++) {
    const toObj = newReps[i].toObject();

    if (i - 1 >= 0) {
      // remove any values given identically in a previous report
      for (const key of Object.keys(Report.schema.tree.diff)) {
        if (_.isEqual(toObj.diff[key], core[key])) {
          delete toObj.diff[key];
        }
      }

      // reference previous report
      toObj.previous = newReps[i - 1]._id;
    }

    for (const key of Object.keys(Report.schema.tree.diff)) {
      // if the property is marked as null, see if it should be
      if (toObj.diff[key] === null) {
        if (core[key] === undefined) {
          // previously the property was undefined
          delete toObj.diff[key]; // the null is unneeded
        } else {
          // null indicates that this report should remove the property from the loo
          delete core[key]; // remove it from our simulated loo
          // leave the null value as is, it is needed to indicate the property removal
        }
      }

      // keep track of how our loo would be generated on-the-fly
      core[key] = _.clone(toObj.diff[key]);
    }

    newReps[i] = new Report(toObj);
    await newReps[i].save();
  }

  // add reference to following loo
  for (var i = 0; i + 1 < newReps.length; i++) {
    newReps[i].next = newReps[i + 1]._id;
    await newReps[i].save();
  }

  return newReps;
};
