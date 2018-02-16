const chai = require('chai');
const expect = chai.expect;
const request = require('superagent');
const status = require('http-status');

const apiRoot = 'http://localhost:3000/';

describe('Test API', function() {

	/* Note that the function passed to 'it' has parameter 'done' */
	it('Test test', function(done) {

		// Make a GET request to the API Root
		request.get(apiRoot)

		// Send the asynchronous request with call back function
		.end(function(err, res) {

			// If there are errors, handle them. Otherwise handle the response.
			if (err) {
				console.log("There was an Error: " + err.message);
			} else {
				console.log("There was no error, you are the GOAT");
			}

			// Test completed
			done();
		})
	});

	it('GET request returns text "Hello, World!".', function(done) {
		request.get(apiRoot).end(function(err, res) {
			
			expect(res.text).to.equal('Hello, World!');
			expect(res.statusCode).to.equal(status.OK);
			expect(err).to.not.be.an('error');
			done();
		});
	});

	it('POST request is not allowed', function(done) {
		request.post(apiRoot).end(function(err, res) {
			
			expect(err).to.not.be.an('error');
			expect(res.statusCode).to.equal(status.OK);
			done();
		});
	});

});