'use strict'

var Loo = require('../../models/loo')
var LooReport = require('../../models/loo_report')
var _ = require('lodash')
var routes = {}


var queryMaker = function(query,options){
	var beginDate = new Date();
	

	if (!(options.timescale === 'Overall' || options.timescale===undefined)){
		beginDate = new Date(options.start);
		var endDate = new Date(options.end);
		query["$and"] = [ { 'createdAt': { '$gte': beginDate }} , { 'createdAt': { '$lte': endDate }}]
	}
	if (options.area === 'All' && options.areaType !== 'All'){
		query['properties.area.'+options.areaType] = {'$exists':true}
	}

	if (options.area !== 'All' && options.areaType !== 'All'){
		query['properties.area.'+options.areaType] = options.area
	}
 	return query
}

var percentify = function(stat,outOf){

	var result = (stat/outOf * 100).toFixed(2) 
	if (isNaN(result)){
		result = 0;
	}
	if (!isFinite(result)){
		result = 100;
	}
	
	return parseFloat(result).toFixed(2);

}




routes.statistics = {
	  

  handler: function * () {
	var standardOptions = {
		timescale:this.query.timescale,
		start:this.query.beginDate,
		end:this.query.endDate,
		area:this.query.area,
		areaType:this.query.areaType
	}


	//used for percentages
    var publicLoos = yield Loo.count(queryMaker({"properties.access":"public"},standardOptions)).exec() //done
    var babyChange = yield Loo.count(queryMaker({"properties.babyChange":"true"},standardOptions)).exec() //done
    var babyChangeUnknown = yield Loo.count(queryMaker({"properties.babyChange":"Not Known"},standardOptions)).exec() //done
    var activeLoos = yield Loo.count(queryMaker({'properties.active': 'true'},standardOptions)).exec() 
    var accessibleLoos = yield Loo.count(queryMaker({'$or':[{'properties.accessibleType': 'unisex'},{'properties.accessibleType':'male and female'}]},standardOptions)).exec() 
    var accessibleLoosUnknown = yield Loo.count(queryMaker({'$or':[{'properties.accessibleType': null},{'properties.accessibleType':''}]},standardOptions)).exec() 



	//standard 
    var loosCount = yield Loo.count(queryMaker({},standardOptions)).exec() //done
    var looReports = yield LooReport.count(queryMaker({},standardOptions)).exec() //done
    var uiReports = yield LooReport.count(queryMaker({'collectionMethod': 'api'},standardOptions)).exec() //done
    var importedReports = looReports - uiReports //done
    var removals = yield LooReport.count(queryMaker({'properties.removal_reason': {$exists: true}},standardOptions)).exec() //done
    var multi_report_loos = yield Loo.count(queryMaker({'reports.1': {$exists: true}},standardOptions)).exec()
    var contributors = yield LooReport.aggregate([
      { $match: {'type': 'Feature' } },
        {
          $group: {
            _id: '$attribution',
            reports: { $sum: 1 }
          }
        }
      ]).exec()

	
    this.status = 200
	
	if (this.query.timescale === "Overall"){
		this.body = yield {
			'numbers':{
				'Total Toilets Added': loosCount,
				'Active Toilets Added': activeLoos,
				'Inactive/Removed Toilets': loosCount - activeLoos,
				'Total Loo Reports Recorded': looReports,
				'Total Reports via Web UI/API': uiReports,
				'Reports from Data Collections': importedReports,
				'Removal Reports Submitted': removals,
				'Loos with Multiple Reports': multi_report_loos			},
				'percentages':{
					"Active Loos": [percentify(activeLoos,loosCount),0],
					"Public Loos": [percentify(publicLoos,loosCount),0],
					"Baby Changing": [percentify(babyChange,loosCount),percentify(babyChangeUnknown,loosCount)],
					"Accessible To All": [percentify(accessibleLoos,loosCount),percentify(accessibleLoosUnknown,loosCount)]


				},
			'Count reports by Attribution': _.transform(contributors, function (acc, val) {
			  acc[val._id] = val.reports
			}, {})
		}
	 }

	 else if(this.query.timescale !== "Overall" && this.query.timescale != undefined){
		this.body = yield {
			'numbers':{
				'Total Toilets Added': loosCount,
				'Total Loo Reports Recorded': looReports,
				'Total Reports via Web UI/API': uiReports,
				'Reports from Data Collections': importedReports,
				'Removal Reports Submitted': removals
				},
				'percentages':{
					"Active Loos": [percentify(activeLoos,loosCount),0],
					"Public Loos": [percentify(publicLoos,loosCount),0]
				}
		}
	 }

	else if (this.query.areaList === 'true'){
		
		//gets list of area lists
		var test  = Loo.schema.eachPath(function(path){return path});
		var areaTypes = Object.keys(test.tree.properties.area)
		areaTypes.unshift('All')
		var temp_body = {'areaTypes':areaTypes,data:{}}


		var allList = []
		for(var i =0;i<areaTypes.length;i++){
			var query = 'properties.area.' + areaTypes[i]			
			var areaList = yield Loo.distinct(query)
			if (areaList.length > 0){
				areaList = areaList.sort()
				console.log(areaTypes[i])
				areaList.unshift("All")
				temp_body.data[areaTypes[i]] = areaList
				allList = allList.concat(areaList)

			}else{
				temp_body.data[areaTypes[i]] = ['All']
			}

		}

		temp_body.data['All'] = allList.sort()

		this.body = yield temp_body
	}
	
	else{
		this.body = yield {"docs":"documentation for stats goes here"}
	}
  }
  ,
  path: '/statistics',
  method: 'get'
}

module.exports = routes

















