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
    diff: {
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
  });
};

/**
 * Convert a list of legacy reports to a list of new reports, chaining them
 * together into a linked list in the process.
 */
exports.toNewReports = function toNewReports(legacies) {
  // create a new report based on a legacy report, with no knowledge of others
  const newReps = legacies.map(exports.toNewReport);

  // iterate through chain of reports
  const core = {};
  for (let i = 0; i < newReps.length; i++) {
    if (i - 1 >= 0) {
      // give reference to previous report
      newReps[i].previous = newReps[i - 1]._id;

      // remove any values given identically in a previous report
      for (const key of Object.keys(Report.schema.tree.diff)) {
        if (_.isEqual(newReps[i].toObject().diff[key], core[key])) {
          newReps[i].diff[key] = undefined;
        }
      }
    }

    for (const key of Object.keys(Report.schema.tree.diff)) {
      // ignore properties not in this report
      if (newReps[i].toObject().diff[key] === undefined) continue;

      // if the property is marked as null, see if it should be
      if (newReps[i].toObject().diff[key] === null) {
        if (core[key] === undefined) {
          // previously the property was undefined
          newReps[i].diff[key] = undefined; // the null is unneeded
        } else {
          // null indicates that this report should remove the property from the loo
          delete core[key]; // remove it from our simulated loo
          // leave the null value as is, it is needed to indicate the property removal
        }
      }

      // keep track of how our loo would be generated on-the-fly
      core[key] = _.clone(newReps[i].toObject().diff[key]);
    }

    // give reference to following report
    if (i + 1 < newReps.length) {
      newReps[i].next = newReps[i + 1]._id;
    }
  }

  return newReps;
};
