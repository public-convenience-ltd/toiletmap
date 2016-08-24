'use strict'

var Loo = require('../../models/loo')
var LooReport = require('../../models/loo_report')
var _ = require('lodash')
var routes = {}


var queryMaker = function(query,timescale,start,end,area,areaType){
	var beginDate = new Date();
	

	//timebased based stuff
	if (!(timescale === 'Overall' || timescale===undefined)){
		beginDate = new Date(start);
		var endDate = new Date(end);
		query["$and"] = [ { 'createdAt': { '$gte': beginDate }} , { 'createdAt': { '$lte': endDate }}]
	}
	
	//if areaType === 'Any' it makes no different


	//this will just give london boroughs if that boroughs thing turns up...
	//there may be holes...
	if (area === 'Any' && areaType !== 'Any'){
		query['properties.area.'+areaType] = {'$exists':true}
	}

	if (area !== 'Any' && areaType !== 'Any'){
		query['properties.area.'+areaType] = area
	}




		

	
	console.log(query)
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

	//used for percentages
    var publicLoos = yield Loo.count(queryMaker({"properties.access":"public"},this.query.timescale,this.query.beginDate,this.query.endDate,this.query.area,this.query.areaType)).exec() //done
    var babyChange = yield Loo.count(queryMaker({"properties.babyChange":"true"},this.query.timescale,this.query.beginDate,this.query.endDate,this.query.area,this.query.areaType)).exec() //done
	
	//N.B baby change and therefore probably attended baby changing automatic and radar dont work since they were switched from bool to string and mongoose is being funky..I believe this to be the reason and I'm working on it
    var activeLoos = yield Loo.count(queryMaker({'properties.active': 'true'},this.query.timescale,this.query.beginDate,this.query.endDate,this.query.area,this.query.areaType)).exec() 


    var loosCount = yield Loo.count(queryMaker({},this.query.timescale,this.query.beginDate,this.query.endDate,this.query.area,this.query.areaType)) //done
    var looReports = yield LooReport.count(queryMaker({},this.query.timescale,this.query.beginDate,this.query.endDate,this.query.area,this.query.areaType)).exec() //done
    var uiReports = yield LooReport.count(queryMaker({'collectionMethod': 'api'},this.query.timescale,this.query.beginDate,this.query.endDate,this.query.area,this.query.areaType)).exec() //done
    var importedReports = looReports - uiReports //done
    var removals = yield LooReport.count(queryMaker({'properties.removal_reason': {$exists: true}},this.query.timescale,this.query.beginDate,this.query.endDate,this.query.area,this.query.areaType)).exec() //done


    var contributors = yield LooReport.aggregate([
      { $match: {'type': 'Feature' } },
        {
          $group: {
            _id: '$attribution',
            reports: { $sum: 1 }
          }
        }
      ]).exec()
    var multi_report_loos = yield Loo.count({'reports.1': {$exists: true}}).exec()


	//calculates percentages
	
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
					"Active Loos": percentify(activeLoos,loosCount),
					"Public Loos": percentify(publicLoos,loosCount),
					"Baby Changing": percentify(babyChange,loosCount)


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
					"Active Loos": percentify(activeLoos,loosCount),
					"Public Loos": percentify(publicLoos,loosCount)
				}
		}
	 }

	else if (this.query.areaList === 'true'){
		var test  = Loo.schema.eachPath(function(path){return path});
		var areaTypes = Object.keys(test.tree.properties.area)
		areaTypes.unshift('Any')
		var temp_body = {'areaTypes':areaTypes,data:{}}

		for(var i =0;i<areaTypes.length;i++){
			var query = 'properties.area.' + areaTypes[i]			
			var areaList = yield Loo.distinct(query)
			if (areaList.length > 0){
				areaList = areaList.sort()
				areaList.unshift("Any")
				temp_body.data[areaTypes[i]] = areaList

			}

		}
		//
		temp_body.data['Any'] = ['Any']
		console.log(temp_body)
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


















