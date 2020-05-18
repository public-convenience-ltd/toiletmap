const api = require('../src/api');
api.listen().then((d) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Toiletmap API on ${d.url}`);
  }
});
