const express = require('express');
const router = express.Router();

const db = require('./../modules/dbHelper');
const sessions = require('./../modules/sessionHelper');
const cookieName = sessions.cookieName;
const misc = require('./../modules/misc');

function post(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session build the nav bar with the user options
	if (sessions.validSession(sessionToken)) {

		sessions.extend(sessionToken, response);

		var email = sessions.getEmail(sessionToken);

		// If the update was valid
		updateInterest(request, email, function(valid){
			if (valid) {
				misc.buildResponse(response, "success");
			} else {
				misc.buildResponse(response, "failure");
			}
		
		});
		
	}
}

function updateInterest(request, email, callback) {

	var event_id = request.body.event_id;
	var state = request.body.state;

	if (event_id && state) {

		if (state === "like") {

			db.each(
				"SELECT * FROM Interest WHERE student_email = ? AND event_id = ?", 
				[ email, event_id ], 
				function(interset) {
				// Count the number of entries. There shouldn't be any.
				}, function(count) {

					if (count == 0) {
	
						db.run("INSERT INTO Interest(event_id, student_email) VALUES (?, ?);", [ event_id, email ]);
						db.run("UPDATE Events SET popularity = popularity + 1  WHERE event_id = ?;", [ event_id ]);
	
						console.log("Interest update: " + email + " liked event " + event_id);
	
						callback(true);
						
					}else{
						callback(false);
					}
				}
			);

		} else if (state === "unlike") {
			
			db.each(
				"SELECT * FROM Interest WHERE student_email = ? AND event_id = ?", 
				[ email, event_id ], 
				function(interset) {
					// Count the number of entries. There should be one.
				}, function(count) {

					if (count == 1) {
		
						db.run("DELETE FROM Interest WHERE event_id = ? AND student_email = ?;", [ event_id, email ]);
						db.run("UPDATE Events SET popularity = popularity - 1  WHERE event_id = ?;", [ event_id ]);

						console.log("Interest update: " + email + " unliked event " + event_id);
		
						callback(true);
						
					}else{
						callback(false);
					}
				}
			);
		}
	}
}

router.post('/', post);

module.exports = router;