var fs = require('fs')

fs.readFile('statistics.js', 'utf8', function (error, data) {
  if (error) { console.log(error) }
  data = data.replace('id', 'wibble')
  console.log(data)
})
