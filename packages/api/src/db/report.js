const _ = require('lodash');
const { Schema, Types } = require('mongoose');
const hasha = require('hasha');

const CoreSchema = require('./core');

const ReportSchema = new Schema(
  {
    contributorId: { type: String },
    contributor: { type: String },
    previous: {
      type: Schema.Types.ObjectId,
      ref: 'NewReport',
      validate: async function(value) {
        // "this.constructor" refers to our static model
        const previous = await this.constructor.findById(value).exec();

        // check that it exists
        if (!previous) {
          throw new Error(`'previous' report ${value} does not exist`);
        }

        return true;
      },
    },
    next: {
      type: Schema.Types.ObjectId,
      ref: 'NewReport',
      validate: async function(value) {
        // "this.constructor" refers to our static model
        const next = await this.constructor.findById(value).exec();

        // check it exists
        if (!next) {
          throw new Error(`'next' report ${value} does not exist`);
        }

        // check that it references us as the previous report
        if (!next.previous.equals(this._id)) {
          throw new Error(
            `'next' report ${value} refers to wrong previous report, ${
              next.previous
            }`
          );
        }

        return true;
      },
    },
    diff: {
      type: CoreSchema,
      validate: async function(value) {
        value = value.toObject();
        if (_.isEqual(value, {})) {
          // TODO decide what we want to do with empty reports
          //throw Error('Report must contribute some information');
        }

        if (this.previous) {
          // generate a loo from previous reports
          await this.populate('previous').execPopulate();
          const looBefore = await this.previous.generateLoo();
          this.depopulate('previous');

          for (const key of Object.keys(value)) {
            if (value[key] === null) {
              if (looBefore.properties[key] === undefined) {
                // we can't remove a property if it wasn't defined previously
                throw Error(
                  `Report unsets property '${key}' that was not set in loo to begin with`
                );
              }
            }

            if (_.isEqual(value[key], looBefore.toObject().properties[key])) {
              // we can't have a duplicate property value - it gives no further information
              throw Error(
                `Report sets property '${key}' to the same value it was before`
              );
            }
          }
        }

        return true;
      },
    },
  },
  { minimize: false, timestamps: true }
);

/**
 * Produce an array of all the reports in the current roll preceeding and including the current target
 */
ReportSchema.methods.unroll = async function() {
  let looroll = [];
  let report = this;

  while (report) {
    looroll.unshift(report); // add to beginning, keeping in order
    if (report.previous) {
      report = await this.model('NewReport').findById(report.previous);
    } else {
      report = null;
    }
  }

  return looroll;
};

ReportSchema.methods.generateLoo = async function() {
  let looroll = await this.unroll();
  let loo = this.model('NewLoo').fromReports(looroll);
  return loo;
};

ReportSchema.methods.deriveFrom = async function(previous) {
  const prevLooState = await previous.generateLoo();
  const propsBefore = prevLooState.toObject().properties;
  const propsChange = this.toObject().diff;

  for (const key of Object.keys(propsChange)) {
    if (
      _.isEqual(propsBefore[key], propsChange[key]) ||
      (propsBefore[key] === undefined && propsChange[key] === null)
    ) {
      this.diff[key] = undefined;
    }
  }
  this.previous = previous._id;
  return this;
};

ReportSchema.methods.nameSuccessor = function(next) {
  this.next = next._id;
};

/**
 * Make a hash of suggested report properties for use as the input to a mongodb ObjectId
 * We use this to create the id of a loo generated from this report so that looids are stable across
 * generation/migration runs.
 */
ReportSchema.methods.suggestLooId = function() {
  // Using the timestamp, the diff, and the contributor should be sufficiently unique
  // whilst also being stable
  let input = JSON.stringify({
    coords: this.diff.geometry.coordinates,
    created: this.createdAt,
    by: this.contributor,
  });
  let hash = hasha(input, { algorithm: 'md5', encoding: 'hex' }).slice(0, 24);
  return hash;
};

/**
 * Find the loo which refers to this report
 * It is an article of faith that there can't be more than one ;-)
 */
ReportSchema.methods.getLoo = async function() {
  return await this.model('NewLoo').findOne({
    reports: Types.ObjectId(this.id),
  });
};

module.exports = exports = ReportSchema;
