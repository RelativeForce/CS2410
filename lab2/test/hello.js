const chai = require('chai');
const expect = chai.expect;
const request = require('superagent');
const status = require('http-status');

describe('Some family of tests',function(){
	/* Note that the function passed to 'it' has parameter 'done' */
	it('Some specific test',function(done){		
		request.get('http://localhost:3000/') // Make a GET request to localhost:3000
			// Send the asynchronous request with call back function
			.end(function(err,res){ 
				// called when the request completes
				if(err){
			
				} 
				// Handle any errors
				else{
				
				} // Otherwise, handle the response, res
				done();
			})
	});
});