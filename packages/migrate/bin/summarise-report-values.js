const fs = require('fs');

// the properties that can be in a new report
const { Report, db } = require('@neontribe/gbptm-loodb')(
  'mongodb://localhost:27017/gbptm'
);
const properties = Object.keys(Report.schema.tree.diff.type.tree);

/**
 * Get the frequency of different values in a new report's "diff"-section
 * properties. Values are given as their JSON representation, with undefined
 * represented as "undefined" as a special case.
 */
function getValueFreqs(group, prop) {
  const valFreqs = {};
  for (const thing of group) {
    const value = thing.diff[prop];
    const label = value === undefined ? 'undefined' : JSON.stringify(value);
    if (!valFreqs[label]) {
      valFreqs[label] = 0;
    }
    valFreqs[label] += 1;
  }
  return valFreqs;
}

/**
 * Print a markdown table representing one of our frequency objects.
 */
function printFreqs(freqs) {
  // heading
  console.log('|Frequency|Value|');
  console.log('|-:|-|');

  // order labels in descending frequency, then alphabetic order
  const labels = Object.keys(freqs).sort((a, b) => {
    if (freqs[a] < freqs[b]) {
      return 1;
    } else if (freqs[a] > freqs[b]) {
      return -1;
    }
    return a.localeCompare(b);
  });

  // print the first 20 frequencies and their values
  for (const label of labels.slice(0, 20)) {
    console.log('|' + freqs[label] + '|`' + label + '`|');
  }

  // signify if there was more we didn't show
  if (freqs.length > 20) {
    console.log('...');
  }

  // markdown needs padding to show that the table terminated
  console.log();
}

// load JSON reps of new reports from stdin
const group = JSON.parse(fs.readFileSync(0));

// heading and summary
console.log('# Analysis of reports');
console.log(`Total: ${group.length}\n`);

// document any properties found that are not in the schema
const strange = [];
for (const thing of group) {
  for (const potential of Object.keys(thing.diff)) {
    if (!properties.includes(potential) && !strange.includes(potential)) {
      strange.push(potential);
    }
  }
}
if (strange.length > 0) {
  const pretty = strange.map(lab => `\`${lab}\``).join(', ');
  console.log(`Properties not in schema: ${pretty}\n`);
}

// print frequency tables for each property
for (const prop of properties) {
  console.log(`## ${prop}\n`);
  printFreqs(getValueFreqs(group, prop));
}

// Close the DB connection
db.close();
