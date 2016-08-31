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
	if (options.area === 'Any' && options.areaType !== 'Any'){
		query['properties.area.'+options.areaType] = {'$exists':true}
	}

	if (options.area !== 'Any' && options.areaType !== 'Any'){
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
    var activeLoos = yield Loo.count(queryMaker({'properties.active': 'true'},standardOptions)).exec() 
    var accessibleLoos = yield Loo.count(queryMaker({'$or':[{'properties.accessibleType': 'unisex'},{'properties.accessibleType':'male and female'}]},standardOptions)).exec() 


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
		this.body = yield {
							"title": "Welcome to the Documentation for the GBPTM statistics page",
							"list of acceptable inputs":[
								{
									'Input Name':'timescale',
									"values": "Appropriate values are: Overall, Year, Month, Week, Custom",
									"use":"Indicates what to set the timescale being searched over is, Overall ignores 'beginDate' and 'endDate' and just returns all results",
									
								},
								{
									'Input Name':"beginDate",
									'values':"Date in the form yyyy/mm/dd",
									'use':'signals the earliest date to search the db from in time based queries',
									'notes':'must be used in conjunction with a "timescale" and an "endDate"'
								
								},
								{
									'Input Name':"endDate",
									'values':"Date in the form yyyy/mm/dd",
									'use':'signals the latest date to search the db from in time based queries',
									'notes':'must be used in conjunction with a "timescale" and an "beginDate"'
								
								},
								{
									'Input Name':'areaType',
									'values':"current can be: Unitary Authority, Unitary Authority ward (UTW), European region, Civil parish/community,UK Parliament constituency, Any. Please notes these may be subject to change in the near future",
									'use':'indicates the type of area that area will then search for',
									'notes':'The "Any" value will simple mean that areaType and area are ignored when searching for toilets'

								},
								{
									'Input Name':'area',
									'values':'values can be whatever is return in the list of acceptable names of areas in the appropriate "areaType" list. This list is access by setting the areaList property to true',
									'use':'Only returns loos in the area supplied',
									'notes':'see "areaList" as to how to get acceptable values'
								},
								{
									'Input Name':'areaList',
									'value':"true or false",
									'use':'provides values for area by areaType with values that we have in our db'

								}

							]
							
						  }
	}
  }
  ,
  path: '/statistics',
  method: 'get'
}

module.exports = routes
















