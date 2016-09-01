'use strict'

var Loo = require('../../models/loo')
var LooList = require('../../models/loo_list')
var config = require('../../config/config')
var routes = {}

routes.nearby_loos = {
    handler: function * () {
		var loos = []
		if (this.query.searchTerm){
    		loos = yield Loo.find({"properties.name" : new RegExp('.*'+this.query.searchTerm+'.*', "i")}).exec()
		}else if (this.query.area){
			loos = yield Loo.find(
			{"$or":[
				{'properties.area.District council':this.query.area},
				{'properties.area.Unitary Authority':this.query.area},
				{'properties.area.Metropolitan district':this.query.area},
				{'properties.area.London borough':this.query.area}
			]})
		}

    	this.status = 200
    	this.body = new LooList(loos)
    },
    path: '/search',
    method: 'get'
}

module.exports = routes
