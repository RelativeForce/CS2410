/**
 * This is a Router which handles requests to the 'events' end point. This end
 * point displays the current user's events.
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
const misc = require('./../modules/misc');
const cookieName = sessions.cookieName;

/**
 * Handles GET requests to / which will respond with a page containing a list of
 * all the events that the current user has organised provides that the
 * cureently signed user is an organier.
 * 
 * @param request
 *            The GET request to the server.
 * @param response
 *            The response that will be sent to the client.
 * @returns undefined
 */
function get(request, response) {

	// Get the session token.
	var sessionToken = request.cookies[cookieName];

	// If there is a user that was signed in.
	if (sessions.validSession(sessionToken)) {

		// Extend the user session.
		sessions.extend(sessionToken, response);

		var user = sessions.getDetails(sessionToken);

		var logout = builder.navbarLink("/logout", "Logout");
		var home = builder.navbarLink("/", "Home");
		var newEvent = builder.navbarLink("/organise", "Orgainse Event");
		var search = builder.navbarLink("/search", "Search Events");
		var profile = builder.navbarLink("/profile?email=" + user.email, "My Profile");

		var navbar = builder.navbar([ home, newEvent, search, profile, logout ]);

		// Collect all the user organised events into a table
		db.collect(
			"SELECT * FROM Events WHERE organiser = ? ORDER BY date(time) DESC", 
			[ user.email ], 
			function(event) {

				event.hasLiked = false;
			
				return event;
			
			}, 
			function(events) {

				// Build the events page
				var eventsTable = builder.eventsTable(events, "My Events", false);
	
				var head = builder.head("Aston Events");
				var body = builder.body(navbar, eventsTable);
				var page = builder.page(head, body);
	
				misc.buildResponse(response, page);
			}
		);

	} else {
		response.redirect('/');
	}

}

router.get('/', get);

module.exports = router;