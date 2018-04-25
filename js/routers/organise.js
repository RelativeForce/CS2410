/**
 * This is a Router which handles requests to the 'organise' end point. This end
 * point handles creating new events.
 * 
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

// NPM Modules
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// My Modules
const db = require('./../modules/dbHelper');
const builder = require('./../modules/pageBuilder');
const sessions = require('./../modules/sessionHelper');
const cookieName = sessions.cookieName;
const misc = require('./../modules/misc');

/**
 * Processes the GET requests to / and will respond with the organise page
 * provided that the request contains a valid session cookie.
 * 
 * @param request
 *            The GET request from the client.
 * @param response
 *            The reponse that will be sent to the client.
 * @returns undefined
 */
function get(request, response) {

	// Get the session token.
	var sessionToken = request.cookies[cookieName];

	// If there is a user siogned in.
	if (sessions.validSession(sessionToken)) {

		// Extend the user session.
		sessions.extend(sessionToken, response);

		var user = sessions.getDetails(sessionToken);

		// If the user is an organiser redirect them to the home page.
		if (user.organiser === 'true') {

			// Construct the organiser home page
			misc.buildPage('organise', function(content) {

				// The elements of the organise page.
				var home = builder.navbarLink("/", "Home");
				var logout = builder.navbarLink("/logout", "Logout");
				var profile = builder.navbarLink("/profile?email=" + user.email, "My Profile");
				var search = builder.navbarLink("/search", "Search Events");
				var myEvents = builder.navbarLink("/events", "My Events");
				
				var navbar = builder.navbar([ home, profile, myEvents, search, logout ]);
				
				var head = builder.head("Organise Event");
				var body = builder.body(navbar, content);

				// The string representation of the page as HTML
				var page = builder.page(head, body);

				misc.buildResponse(response, page);
			});

		} else {
			response.redirect('/');
		}

	} else {
		response.redirect('/');
	}

}

/**
 * Processes POST requests to the 'organise' end point while will take a request
 * to add a new event. If the request is from a client that is not anorganiser
 * then the client will be redirected to the home page.
 * 
 * @param request
 *            The POST request to the serevr.
 * @param response
 *            The response that will be sent to the client.
 * @returns undefined
 */
function post(request, response) {

	// Get the session token.
	var sessionToken = request.cookies[cookieName];

	// If there is a user signed in.
	if (sessions.validSession(sessionToken)) {

		// Extend the user session.
		sessions.extend(sessionToken, response);

		var user = sessions.getDetails(sessionToken);

		// If the user is a organiser.
		if (user.organiser === 'true') {

			db.each(
				"SELECT * FROM Events",
				[], 
				function(row) {
					// Count the results
				}, function(count) {

					/*
					 * This is only used as the way to make a new ID as there is no
					 * wa to delete them.
					 */
					var event_id = count;
	
					// Add event and pictures to the database
					addEvent(request, user.email, event_id);
					misc.changeEventPictures(request, event_id)
	
					response.redirect('/event?event_id=' + event_id);
				}
			);

		} else {
			response.redirect('/');
		}

	} else {
		response.redirect('/');
	}

}

/**
 * Add the event specifed by the request to the database.
 * 
 * @param request
 *            The POST request that was sent to the server.
 * @param email
 *            The email of the organiser.
 * @param event_id
 *            The id of the new event.
 * @returns undefined
 */
function addEvent(request, email, event_id) {

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

	// Add the event to the database.
	db.run(
		"INSERT INTO Events (event_id, name, description, organiser, type, time, location, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
		[event.id, event.name, event.description, event.organiser, event.type, event.time, event.location, event.popularity ]
	);

	console.log("New Event: " + event.name);

}

router.get('/', get);
router.post('/', post);

module.exports = router;