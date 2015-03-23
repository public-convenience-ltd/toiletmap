#!/usr/bin/env node

var program = require('commander')
var pkg = require('../package.json')
var co = require('co')
var ProgressBar = require('progress')

program
  .version(pkg.version)
  .usage('[options]')
  .option('-m, --mongo <url>', 'Mongo Connection URL')
  .option('-p, --purge', 'Purge existing Loos')

program.on('--help', function () {
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
  console.log('')
})

program.parse(process.argv)

// Populate this env with mongo details from the arguments
process.env.MONGO_URL = program.mongo || 'mongodb://localhost:27017/gbptm'
require('../config/mongo')

var config = require('../config/config.js')
require('../config/mongo')
var LooReport = require('../models/loo_report.js')
var Loo = require('../models/loo.js')

co(function * () {
  console.log('Operating on ' + config.mongo.url)
  var loos = yield Loo.count().exec()
  if (program.purge) {
    yield Loo.remove().exec()
    console.warn('Purged ' + loos + ' Loos')
  }

  var reportcount = yield LooReport.count().exec()
  console.log('Regenerating Loos from ' + reportcount + ' reports')

  var reports = yield LooReport.find().exec()

  var results = []
  var errors = []

  var bar = new ProgressBar(' regenerating [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 30,
    total: reports.length
  })

  while (reports.length) {
    try {
      results.push(yield reports.pop().looificate())
    } catch (e) {
      errors.push(e)
    }
    bar.tick(1)
  }

  console.log('Errors: ' + errors)
}).then(function () {process.exit(0)})
