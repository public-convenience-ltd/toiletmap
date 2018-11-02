const _ = require('lodash');
const { Schema } = require('mongoose');

const CoreSchema = require('./core');

const ReportSchema = new Schema(
  {
    contributor: { type: String },
    previous: {
      type: Schema.Types.ObjectId,
      ref: 'NewReport',
      validate: async function(value) {
        // "this.constructor" refers to our static model
        const previous = await this.constructor.findById(value);

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
        const next = await this.constructor.findById(value);

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

ReportSchema.methods.generateLoo = async function() {
  await this.populate('previous').execPopulate();
  let previous = this.previous;
  this.depopulate('previous');

  // find all reports preceding this one, including this one
  let allPrevious = [this];
  while (previous) {
    allPrevious.unshift(previous); // add to beginning, keeping in order
    await this.constructor.populate(previous, { path: 'previous' });
    previous = previous.previous;
  }

  return this.model('NewLoo').fromReports(allPrevious);
};

ReportSchema.methods.deriveFrom = async function(previous) {
  const propsBefore = (await previous.generateLoo()).toObject().properties;
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
};

ReportSchema.methods.nameSuccessor = function(next) {
  this.next = next._id;
};

module.exports = exports = ReportSchema;
