const express = require('express');
const router = express.Router();

const db = require('./../modules/dbHelper');
const builder = require('./../modules/pageBuilder');
const sessions = require('./../modules/sessionHelper');
const cookieName = sessions.cookieName;
const misc = require('./../modules/misc');


/**
 * Processes the GET requests to the primary end point which will respond with
 * the home page or landing page depending on whether the response contains
 * valid session cookie.
 * 
 * @param request
 *            The request from the client that may contain the session cookie.
 * @param response
 *            The langing OR home page.
 * @returns undefined
 */
function get(request, response) {

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
			
				// If there is a row send the home page of that user.
				home(request, response, user);

			}, 
			function(count) {

	
				// If there is no user with that email show the landing
				// page.
				if (count == 0) {
					landing(request, response);
				}
			}
		);

	} else {
		
		// If there is no valid session send the landing page.
		landing(request, response);
	}
}

function home(request, response, user) {

	// Construct the student home page
	misc.buildPage(
		'home', 
		function(content) {

			var logout = builder.navbarLink("/logout", "Logout");
			var profile = builder.navbarLink("/profile?email=" + user.email, "My Profile");
			var newEvent = builder.navbarLink("/organise", "Orgainse Event");
			var search = builder.navbarLink("/search", "Search Events");
			var myEvents = builder.navbarLink("/events", "My Events");

			var navbar = builder.navbar((user.organiser === 'true') ? 
				[ newEvent, myEvents, search, profile, logout ] : 
				[ search, profile, logout ]);

			var queryText = "SELECT * FROM Events ORDER BY date(time) DESC";
		
			db.collect(
				queryText, 
				[], 
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

					db.each(
						"SELECT * FROM Interest WHERE student_email = ?",
						[user.email], 
						function(row) {

							for(var index = 0; index < events.length; index++){	
								var current = events[index];
								
								if(row.event_id === current.id){
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

function landing(request, response) {

	// Construct the landing page
	misc.buildPage('landing', function(content) {	

		var queryText = "SELECT * FROM Events ORDER BY date(time) DESC";
		
		db.collect(queryText, [], function(rawEvent){
			
			return {
				"name" : rawEvent.name,
				"id" : rawEvent.event_id,
				"location" : rawEvent.location,
				"time" : rawEvent.time,
				"type" : rawEvent.type,
				"organiser" : rawEvent.organiser,
				"popularity": rawEvent.popularity,
				"hasLiked" : false
			};

		}, function(events){
			
			var search = builder.navbarLink("/search", "Search Events");
			var login = builder.navbarLink("/login", "Login");
			var navbar = builder.navbar([ login, search ]);
			
			var eventsTable = builder.eventsTable(events, "All Events", false);

			var head = builder.head("Aston Events");
			var body = builder.body(navbar, content + eventsTable);
			var page = builder.page(head, body);

			misc.buildResponse(response, page);
			
		});
		
	});
	
}

router.get('/', get);

module.exports = router;