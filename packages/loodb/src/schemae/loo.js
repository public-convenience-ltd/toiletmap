const { Schema } = require('mongoose');

const CoreSchema = require('./core');

const LooSchema = new Schema(
  {
    properties: CoreSchema,
  },
  { minimize: false }
);

/**
 * Create a Loo from a list of LooReports.
 */
LooSchema.statics.fromReports = function(reports) {
  // generate the loo from the sequence of diffs
  const properties = {};
  for (const rep of reports) {
    for (const [key, value] of Object.entries(rep.toObject().diff)) {
      if (value === null) {
        // null indicates that the value was unset in this report
        delete properties[key];
      } else if (value !== undefined) {
        // otherwise, if we have a valid property, update it within the loo
        properties[key] = value;
      }
    }
  }

  // "this" refers to our static model
  return new this({ properties });
};

module.exports = exports = LooSchema;
