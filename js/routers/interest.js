/**
 * This is a Router which handles requests to the 'interest' end point. This end
 * point updates the interest between a user and an event.
 * 
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

// NPM Modules
const express = require('express');
const router = express.Router();

// My Modules
const db = require('./../modules/dbHelper');
const sessions = require('./../modules/sessionHelper');
const cookieName = sessions.cookieName;
const misc = require('./../modules/misc');

/**
 * Handles POST requests to / and will respond with either 'success' or
 * 'failure' depending on whether the interest wa updated.
 * 
 * @param request
 *            The POST request sent to the router.
 * @param response
 *            The response that will be sent back to the client.
 * @returns undefined
 */
function post(request, response) {

	// Get the session token.
	var sessionToken = request.cookies[cookieName];

	// If there is a user signed in.
	if (sessions.validSession(sessionToken)) {

		// Extend the user session
		sessions.extend(sessionToken, response);

		var user = sessions.getDetails(sessionToken);

		// Attempt to update the user's interest in the event.
		updateInterest(
			request, 
			user.email, 
			function(valid) {

				// If the update to the user's interest occured.
				if (valid) {
					misc.buildResponse(response, "success");
				} else {
					misc.buildResponse(response, "failure");
				}

			}
		);

	}
}

/**
 * Updates the interest between an event and a user.
 * 
 * @param request
 *            The POST request sent to the router.
 * @param email
 *            The email of the suer.
 * @param callback
 *            The callback that will be called once the interest is updated.
 * @returns undefined
 */
function updateInterest(request, email, callback) {

	var event_id = request.body.event_id;
	var state = request.body.state;

	// If the event id and interest state are populated.
	if (event_id && state) {

		// Like or unlike based on the specifed state.
		if (state === "like") {
			likeEvent(event_id, email, callback);
		} else if (state === "unlike") {
			unlikeEvent(event_id, email, callback);
		} else {
			callback(false);
		}

	} else {
		callback(false);
	}
}

/**
 * Updates the interest of the user so that they has liked the specifed event.
 * 
 * @param event_id
 *            The id of the specified event.
 * @param email
 *            The email of the user.
 * @param callback
 *            The callback that will be called once the interest is updated.
 * @returns undefined
 */
function likeEvent(event_id, email, callback) {

	db.each(
		"SELECT * FROM Interest WHERE student_email = ? AND event_id = ?", 
		[ email, event_id ], 
		function(interset) {
			// Count the number of entries. There shouldn't be any.
		}, function(count) {

			// If the user is not already interested.
			if (count == 0) {
	
				// Add interest entry
				db.run("INSERT INTO Interest(event_id, student_email) VALUES (?, ?);", [ event_id, email ]);
	
				// Increase the popularity of the event.
				db.run("UPDATE Events SET popularity = popularity + 1  WHERE event_id = ?;", [ event_id ]);
	
				console.log("Interest update: " + email + " liked event " + event_id);
	
				callback(true);
	
			} else {
				callback(false);
			}
		}
	);

}

/**
 * Updates the interest of the user so that they has not liked the specifed
 * event.
 * 
 * @param event_id
 *            The id of the specified event.
 * @param email
 *            The email of the user.
 * @param callback
 *            The callback that will be called once the interest is updated.
 * @returns undefined
 */
function unlikeEvent(event_id, email, callback) {

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
	
			} else {
				callback(false);
			}
		}
	);

}

router.post('/', post);

module.exports = router;