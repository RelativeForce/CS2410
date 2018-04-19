const express = require('express');
const router = express.Router();

const db = require('./../modules/dbHelper');
const builder = require('./../modules/pageBuilder');
const sessions = require('./../modules/sessionHelper');
const misc = require('./../modules/misc');
const cookieName = sessions.cookieName;

function get(request, response){
	
	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session build the nav bar with the user options
	if (sessions.validSession(sessionToken)) {
		
		sessions.extend(sessionToken, response);
		
		var email = sessions.getEmail(sessionToken);

		db.each(
			"SELECT * FROM Users WHERE email = ?",
			[email], 
			function(user) {
			
				var logout = builder.navbarLink("/logout", "Logout");
				var home = builder.navbarLink("/", "Home");
				var newEvent = builder.navbarLink("/organise", "Orgainse Event");
				var search = builder.navbarLink("/search", "Search Events");
				var profile = builder.navbarLink("/profile?email=" + email, "My Profile");
	
				var navbar = builder.navbar([ home, newEvent, search, profile, logout ]);
	
				db.collect(
					"SELECT * FROM Events WHERE organiser = ? ORDER BY date(time) DESC", 
					[email], 
					function(row){
					
						return {
							"name" : row.name,
							"id" : row.event_id,
							"type" : row.type,
							"location" : row.location,
							"time" : row.time,
							"organiser" : row.organiser,
							"popularity": row.popularity,
							"hasLiked" : false
						};
					}, 
					function(events){
	
						var eventsTable = builder.eventsTable(events, "My Events", false);
						
						var head = builder.head("Aston Events");
						var body = builder.body(navbar, eventsTable);
						var page = builder.page(head, body);

						misc.buildResponse(response, page);
					}
				);

			}, 
			function(count) {
			
				// If there is no user with that email show the landing page.
				if (count == 0) {
					response.redirect('/');
				}
			}
		);

	} else {
		response.redirect('/');
	}
	
	
}

router.get('/', get);

module.exports = router;