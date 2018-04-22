/**
 * This is a Router which handles requests to the 'root' end point. This end
 * point displays the home page or landing page depending on whether there is a
 * user signed in.
 * 
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

// NPM Modules
const express = require('express');
const router = express.Router();

// My Modules
const db = require('./../modules/dbHelper');
const builder = require('./../modules/pageBuilder');
const sessions = require('./../modules/sessionHelper');
const cookieName = sessions.cookieName;
const misc = require('./../modules/misc');

/**
 * Handles GET requests to the primary end point which will respond with the
 * home page or landing page depending on whether the response contains valid
 * session cookie.
 * 
 * @param request
 *            The GET request that was sent to the server.
 * @param response
 *            The response the will be sent to the client.
 * @returns undefined
 */
function get(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session build the nav bar with the user options
	if (sessions.validSession(sessionToken)) {
		sessions.extend(sessionToken, response);

		var user = sessions.getDetails(sessionToken);

		// If there is a row send the home page of that user.
		home(response, user);

	} else {

		// If there is no valid session send the landing page.
		landing(response);
	}
}

/**
 * Builds the home page which is displayed to signed in users.
 * 
 * @param response
 *            The response that will be sent to the client.
 * @param user
 *            The current users details.
 * @returns undefined.
 */
function home(response, user) {

	// Construct the student home page
	misc.buildPage(
		'home', 
		function(content) {

			var logout = builder.navbarLink("/logout", "Logout");
			var profile = builder.navbarLink("/profile?email=" + user.email, "My Profile");
			var newEvent = builder.navbarLink("/organise", "Orgainse Event");
			var search = builder.navbarLink("/search", "Search Events");
			var myEvents = builder.navbarLink("/events", "My Events");
	
			var navbar = builder.navbar(
				(user.organiser === 'true') ? 
				[ newEvent, myEvents, search, profile, logout ] : 
				[ search, profile, logout ]
			);
	
			var queryText = "SELECT * FROM Events ORDER BY date(time) DESC";
	
			// Colect all the events.
			db.collect(
				queryText, 
				[], 
				function(event) {
	
					event.hasLiked = false;
					return event;
				}, 
				function(events) {
		
					// Check if the current user has liked any of the events.
					db.each(
						"SELECT * FROM Interest WHERE student_email = ?", 
						[ user.email ], 
						function(row) {
		
							/*
							 * Iterate over all the events and if the current user has shown
							 * interest oin the event set the event as liked.
							 */
							for (var index = 0; index < events.length; index++) {
								var current = events[index];
			
								if (row.event_id === current.id) {
									current.hasLiked = true;
								}
							}
		
						}, 
						function(interestCount) {
			
							var eventsTable = builder.eventsTable(events, "All Events", true);
			
							var head = builder.head("Aston Events");
							var body = builder.body(navbar, content + eventsTable);
							var page = builder.page(head, body);
			
							misc.buildResponse(response, page);
						}
					);
				}
			);
		}
	);

}

/**
 * Builds the landing page that is displayed to all non signed in users.
 * 
 * @param response
 *            The response that will be sent to the client.
 * @returns undefined
 */
function landing(response) {

	// Construct the landing page
	misc.buildPage(
		'landing', 
		function(content) {

			var queryText = "SELECT * FROM Events ORDER BY date(time) DESC";
	
			// Collect all the events
			db.collect(
				queryText, 
				[],
				function(event) {
	
					event.hasLiked = false;
					return event;
				}, 
				function(events) {
	
					var search = builder.navbarLink("/search", "Search Events");
					var login = builder.navbarLink("/login", "Login");
					var navbar = builder.navbar([ login, search ]);
		
					var eventsTable = builder.eventsTable(events, "All Events", false);
		
					var head = builder.head("Aston Events");
					var body = builder.body(navbar, content + eventsTable);
					var page = builder.page(head, body);
		
					misc.buildResponse(response, page);
	
				}
			);
		}
	);
}

router.get('/', get);

module.exports = router;