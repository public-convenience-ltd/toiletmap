const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello Rupert');
});

app.listen(process.env.PORT || 8080, () => {
  /* eslint-disable no-console */
  console.log(`Listening on ${process.env.PORT || 8080}`);
  console.log(`value of process.env.FOO = ${process.env.FOO}`);
  /* eslint-enable no-console */
});
