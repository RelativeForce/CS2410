const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const db = require('./../modules/dbHelper');
const builder = require('./../modules/pageBuilder');
const sessions = require('./../modules/sessionHelper');
const cookieName = sessions.cookieName;
const misc = require('./../modules/misc');

/**
 * Processes the GET requests to the 'organise' end point which will respond
 * with the organise page provided that the request contains a valid session
 * cookie.
 * 
 * @param request
 *            The request from the client that should contain the session
 *            cookie.
 * @param response
 *            The reponse that will be sent to the client.
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
			function(row) {

				// If the user is not an organiser redirect them to the home page.
				if (row.organiser !== 'true') {
					response.redirect('/CS2410/coursework');
				} else {
				
					// Construct the organiser home page
					misc.buildPage(
						'organise', 
						function(content) {

							// The elements of the organise page.
							var home = builder.navbarLink("/CS2410/coursework", "Home");
							var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
							var profile = builder.navbarLink("/CS2410/coursework/profile?email=" + email,"My Profile");
							var search = builder.navbarLink("/CS2410/coursework/search","Search Events");
							var myEvents = builder.navbarLink("/CS2410/coursework/events","My Events");
							var navbar = builder.navbar([ home, profile, myEvents, search, logout ]);
							var head = builder.head("Aston Events");
							var body = builder.body(navbar, content);
						
							// The string representation of the page as HTML
							var page = builder.page(head, body);
		
							misc.buildResponse(response, page);
						}
					);

				}

			}, 
			function(count) {
	
				// If there is no user with that email.
				if (count == 0) {
					response.redirect('/CS2410/coursework');
				}
			}
		);

	} else {
		response.redirect('/CS2410/coursework');
	}

}

/**
 * Processes POST requests to the 'organise' end point while will take a request
 * to add a new event. If the request is from a client that is not anorganiser
 * then the client will be redirected to the home page.
 * 
 * @param request
 *            Must contain a valid session from a user that is a organiser.
 * @param response
 *            Either a redirect the event view for the new event that has been
 *            created or a redirect to the home page if the request is not
 *            valid.
 * @returns undefined
 */
function post(request, response) {

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

				// If the user is not a organiser.
				if (user.organiser !== 'true') {
					response.redirect('/CS2410/coursework');
				} else {

					db.each(
						"SELECT * FROM Events",
						[],
						function(row) {
							// Count the results
						},
						function(count) {
							
							// TEMP ID GENTERATION!!!!!
							var event_id = count;
								
							// Add event and pictures to the database
							addEvent(request, email, event_id);	
							misc.changeEventPictures(request, event_id)

							response.redirect('/CS2410/coursework/event?event_id=' + event_id);
						}
					);
				}
			}, 
			function(count) {

				// If there is no user with that email.
				if (count == 0) {
					response.redirect('/CS2410/coursework');
				}
			}
		);

	} else {
		response.redirect('/CS2410/coursework');
	}

}

function addEvent(request, email, event_id){
	
	var event = {
		"name" : misc.encodeHTML(request.body.name),
		"id" : event_id,
		"location" : misc.encodeHTML(request.body.location),
		"time" : misc.encodeHTML(request.body.date + " " + request.body.time),
		"organiser" : misc.encodeHTML(email),
		"description" : misc.encodeHTML(request.body.description),
		"type" : misc.encodeHTML(request.body.type),
		"popularity" : 0
	};

	db.run(
		"INSERT INTO Events (event_id, name, description, organiser, type, time, location, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
		[event.id, event.name, event.description, event.organiser, event.type, event.time, event.location, event.popularity]
	);
	
	console.log("New Event: " + event.name);
	
}

router.get('/', get);
router.post('/', post);

module.exports = router;