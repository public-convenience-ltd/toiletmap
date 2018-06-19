var fs = require('fs');

fs.readFile('statistics.js', 'utf8', function(error, data) {
  if (error) {
    /* eslint-disable-next-line no-console */
    console.log(error);
  }
  data = data.replace('id', 'wibble');
  /* eslint-disable-next-line no-console */
  console.log(data);
});
