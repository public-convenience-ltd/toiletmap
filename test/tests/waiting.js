
it('Add new loo',function(done){
	
	var req = request
	.post('/reports')
	.send({
		properties:{
			name : "Test+Loo",
			access : "public",
			type : "female",
			accessibleType : "",
			opening :"24/7",
			attended :"true",
			babyChange :"false",
			automatic : "",
			radar :"true",
			fee :"0.10",
			notes: "No"
		},
		geometry:{		
			type : "Point",
			coordinates:{
				0 :"-0.1753091812133789",
				1 :"51.50058673898089"
			}
		},
		origin: "Great+British+Public+Toilet+Map"

	})
    	.set('Accept', 'text/html')
	agent.attachCookies(req)
	req.expect(function(res){
		console.log(res.body,res.text)
	})
	.end(done)
});


/*
//TODO FIX
it('test that the loo removed previously was removed',function(done){
	request
	.get('/loos/'+stringID)
    	.set('Accept', 'application/json')
	.expect(function(res){
		//console.log(res.body)
	})
	.end(done)
});


