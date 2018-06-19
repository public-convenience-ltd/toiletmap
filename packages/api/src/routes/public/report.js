const LooReport = require('../../models/loo_report');
const routes = [];

/**
 * GET all reports
 */
// routes.push({
//   handler: async (req, res) => {
//     const reports = await LooReport.find().exec();
//     res.status(200).json(new LooList(reports));
//   },
//   path: '/reports',
//   method: 'get',
// });

routes.push({
  handler: async (req, res) => {
    const id = req.params.id.replace('.json', '');
    const report = await LooReport.findById(id).exec();
    if (!report) {
      return res.status(404).end();
    }
    res.status(200).json(report);
  },
  path: '/reports/:id',
  method: 'get',
});

module.exports = routes;
