const express = require('express');
const router = express.Router();

const loos = require('./loos');
const reports = require('./reports');
const areas = require('./areas');
const search = require('./search');
const statistics = require('./statistics');

router.use('/loos', loos);
router.use('/reports', reports);
router.use('/admin_geo', areas);
router.use('/search', search);
router.use('/statistics', statistics);

module.exports = router;
