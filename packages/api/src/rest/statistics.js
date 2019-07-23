const express = require('express');
const router = express.Router();

function handleDeprecated(res) {
  res.status(400).json({
    message:
      'This API endpoint has moved permanently to the GraphQL API interface. [TODO more info]',
  });
}

router.get('/counters', (req, res) => handleDeprecated(res));

router.get('/proportions', (req, res) => handleDeprecated(res));

router.get('/contributors', (req, res) => handleDeprecated(res));

module.exports = router;
