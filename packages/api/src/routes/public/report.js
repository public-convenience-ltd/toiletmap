const express = require('express');
const router = express.Router();
const LooReport = require('../../models/loo_report');

/**
 * GET all reports
 */
// router.get('/reports', async (req, res) => {
//   const reports = await LooReport.find().exec();
//   res.status(200).json(new LooList(reports));
// });

/**
 * GET report by id
 */
router.get('/reports/:id', async (req, res) => {
  const id = req.params.id.replace('.json', '');
  const report = await LooReport.findById(id).exec();
  if (!report) {
    return res.status(404).end();
  }
  res.status(200).json(report);
});

module.exports = router;
