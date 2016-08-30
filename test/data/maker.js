var fs = require('fs');

fs.readFile("statistics.js", "utf8", function (error, data) {
	data = data.replace('id','wibble')
	console.log(data);
});



