looSchema.methods.updateArea = function * (){
	var _this = this;
	var domain ='http://mapit.mysociety.org/point/4326/'+_this.geometry.coordinates[0]+','+ _this.geometry.coordinates[1] 
	request(domain, function (error, response, body) {
		var area = {}
		var useableFields = ['Unitary Authority', 'Unitary Authority ward (UTW)','European region','Civil parish/community','UK Parliament constituency'] 
		if (!error && response.statusCode == 200) {
			try{
				body = JSON.parse(body)
			}catch{
				console.log("okay that failed...")
				throw('json parse was not successful')
			}

			for (var property in body) {
				if (useableFields.indexOf(property['type_name']) >= 0) {
					area[property['type_name']] = property['name']
					console.log(area)
				}
				
			}

			return _this
		}
	});
}

