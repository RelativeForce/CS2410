/**
 * This is a Router which handles requests to the 'event' end point. This end
 * point is responsible for displaying the information of a event and also
 * allowing organisers that are signed in to modify an event provided they
 * organised it.
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
const misc = require('./../modules/misc');
const cookieName = sessions.cookieName;

/**
 * Handles GET requests to / and will respond with the view event page based on
 * the 'event_id' param in the query.<br>
 * The response will redirect to the home page if:
 * <ul>
 * <li>There is no 'event_id'.</li>
 * <li>There is an 'event_id' is invalid.</li>
 * </ul>
 * 
 * @param request
 *            The GET request sent to the router.
 * @param response
 *            The response that will be sent back to the client.
 * @returns undefined
 */
function get(request, response) {

	/*
	 * If the event id is defined in the query.
	 */
	if (request.query.event_id) {

		var event_id = request.query.event_id;

		/*
		 * Iterate over all the events with the specifed id. There will only be
		 * one as event id is unique.
		 */
		db.each(
			"SELECT * FROM Events WHERE event_id = ?", 
			[ event_id ], 
			function(event) {
	
				/*
				 * Get the event pictures.
				 */
				eventPictures(event_id, function(pictures) {
	
					/*
					 * Add the pictures arrray and a default has liked value to the
					 * event.
					 */
					event.pictures = pictures;
					event.hasLiked = false;
	
					/*
					 * Check for the session cookie and wherther it is active.
					 */
					var sessionToken = request.cookies[cookieName];
	
					/*
					 * If there is a user signed in.
					 */
					if (sessions.validSession(sessionToken)) {
	
						/*
						 * Extend the user session.
						 */
						sessions.extend(sessionToken, response);
	
						/*
						 * Retreive the user details of the session.
						 */
						var user = sessions.getDetails(sessionToken);
	
						var logout = builder.navbarLink("/logout", "Logout");
						var profile = builder.navbarLink("/profile?email=" + user.email, "My Profile");
						var newEvent = builder.navbarLink("/organise", "Orgainse Event");
						var search = builder.navbarLink("/search", "Search Events");
						var home = builder.navbarLink("/", "Home");
	
						var navbar = builder.navbar(
							user.organiser === "true" ? 
							[ home, newEvent, search, profile, logout ] : 
							[ home, search, profile, logout ]
						);
	
						/*
						 * Check if the current user has liked the event.
						 */
						db.each(
							"SELECT * FROM Interest WHERE student_email = ? AND event_id = ?", 
							[ user.email, event.event_id ], 
							function(row) {
								/*
								 * If there is a entry then the user has liked the
								 * event.
								 */
								event.hasLiked = true;
							}, function(interestCount) {
	
								/*
								 * Pass an whether the current user is the event
								 * organiser.
								 */
								build_ViewEvent(
									response, 
									navbar,
									event, 
									event.organiser === user.email ? "organiser" : "student"
								);
							}
						);
	
					} else {
	
						var login = builder.navbarLink("/login", "Login");
						var home = builder.navbarLink("/", "Home");
						var search = builder.navbarLink("/search", "Search Events");
						var navbar = builder.navbar([ home, search, login ]);
	
						/*
						 * Pass an false as the user is not signed in.
						 */
						build_ViewEvent(response, navbar, event, "");
					}
				});

			}, 
			function(eventCount) {

				/*
				 * If there is no event with that id show the landing page.
				 */
				if (eventCount == 0) {
					response.redirect('/');
				}
			}
		);

	} else {

		/*
		 * If there was no specied event id.
		 */
		response.redirect('/');
	}

}

/**
 * Handles GET requests to /edit and will respond with the edit event form based
 * on the 'event_id' param in the query. <br>
 * The response will redirect the client:
 * <ul>
 * <li>To the home page if there is no 'event_id'.</li>
 * <li>To the home page if there is an 'event_id' is invalid.</li>
 * <li>To the view event page if there is no user signed in.</li>
 * <li>To the view event page if the current user that is signed in is not the
 * organiser of the event.</li>
 * </ul>
 * 
 * @param request
 *            The GET request sent to the router.
 * @param response
 *            The response that will be sent back to the client.
 * @returns undefined
 */
function get_edit(request, response) {

	/*
	 * If the event id is specifed
	 */
	if (request.query.event_id) {

		var event_id = request.query.event_id;

		/*
		 * Iterate over all the events with the specifed id.
		 */
		db.each(
			"SELECT * FROM Events WHERE event_id = ?", 
			[ event_id ], 
			function(event) {

				/*
				 * Retrieve all the events pictures
				 */
				eventPictures(event_id, function(pictures) {
	
					/*
					 * Add the pictures array to the event.
					 */
					event.pictures = pictures;
	
					/*
					 * Check for the session cookie and wherther it is active.
					 */
					var sessionToken = request.cookies[cookieName];
	
					/*
					 * If there is a user signed in.
					 */
					if (sessions.validSession(sessionToken)) {
	
						/*
						 * Extend the user session.
						 */
						sessions.extend(sessionToken, response);
	
						var user = sessions.getDetails(sessionToken);
	
						/*
						 * If the user is the organiser of the event build the edit
						 * event page, otherwise redirect to the view event page.
						 */
						if (event.organiser === user.email) {
	
							build_EditEvent(response, event);
	
						} else {
							response.redirect('/event?event_id=' + event_id);
						}
	
					} else {
						response.redirect('/event?event_id=' + event_id);
					}
				});

			}, function(eventCount) {

				/*
				 * If there is no event with that id show the landing page.
				 */
				if (eventCount == 0) {
					response.redirect('/');
				}
			}
		);

	} else {

		/*
		 * If there is no event id specified.
		 */
		response.redirect('/');
	}

}

/**
 * Handles POST requests to /edit and update the event details.
 * 
 * @param request
 *            The POST request sent to the router.
 * @param response
 *            The response that will be sent back to the client.
 * @returns undefined
 */
function post_edit(request, response) {

	/*
	 * If all the fields are populated.
	 */
	if (request.body.event_id && 
		request.body.name && 
		request.body.location && 
		request.body.date &&
		request.body.time && 
		request.body.description && 
		request.body.type) {

		var event_id = request.body.event_id;

		db.each(
			"SELECT * FROM Events WHERE event_id = ?", 
			[ event_id ], 
			function(event) {
			
				/*
				 * Get the seesion token.
				 */
				var sessionToken = request.cookies[cookieName];
		
				/*
				 * If there is a user signed in.
				 */
				if (sessions.validSession(sessionToken)) {
		
					/*
					 * Extend the user session.
					 */
					sessions.extend(sessionToken, response);
		
					var user = sessions.getDetails(sessionToken);
		
					/*
					 * If the event is owned by the current user.
					 */
					if (event.organiser === user.email) {
			
						/*
						 * The edited event.
						 */
						var editedEvent = {
							"name" : misc.encodeHTML(request.body.name),
							"id" : misc.encodeHTML(request.body.event_id),
							"location" : misc.encodeHTML(request.body.location),
							"time" : misc.encodeHTML(request.body.date + " " + request.body.time),
							"organiser" : user.email,
							"description" : misc.encodeHTML(request.body.description),
							"type" : misc.encodeHTML(request.body.type),
							"popularity" : event.popularity
						};
			
						/*
						 * Update the event.
						 */
						misc.changeEventPictures(request, event_id);
						updateEvent(editedEvent);
			
						/*
						 * Redirect to the view event page.
						 */
						response.redirect('/event?event_id=' + event_id);
		
					}else{
						
						/*
						 * If the user did not organise the specifed event.
						 */
						response.redirect('/');
					}
				
				} else {
					
					/*
					 * If there is no user signed in.
					 */
					response.redirect('/');
				}

			}, 
			function(count) {
		
				/*
				 * If there is no event with that id.
				 */
				if (count == 0){
					response.redirect('/');
				}
			}
		);

	} else {
		
		/*
		 * If there are missing fields.
		 */
		response.redirect('/');
	}

}

/**
 * Collects all the event picture paths into an array whihc is then passed as
 * the only parameter to the specifed callback function.
 * 
 * @param event_id
 *            The event id of the event image which the pictures were requested
 *            for.
 * @param callback
 *            The call back that will be executed once all the picture paths
 *            have been collected.
 * @returns undefined
 */
function eventPictures(event_id, callback) {

	/*
	 * Collect all the event image pictures into an array then pass them to the
	 * callback.
	 */
	db.collect(
		"SELECT * FROM Event_Pictures WHERE event_id = ?", 
		[ event_id ],
		function(pictureEntry) {
			
			return pictureEntry.picture;
		}, function(pictures) {
			
			callback(pictures);
		}
	);

}

/**
 * Builds the view event page then adds it to the specified response.
 * 
 * @param response
 *            The response that will be sent to the client.
 * @param navbar
 *            The navbar the will be displayed at the top of the page.
 * @param event
 *            The event that will be viewed.
 * @param canEdit
 *            Whether or not the current user can modify the current event.
 * @returns undefined
 */
function build_ViewEvent(response, navbar, event, canEdit) {

	var head = builder.head("Event");
	var eventHTML = builder.viewEvent(event, canEdit);
	var body = builder.body(navbar, eventHTML);
	var page = builder.page(head, body);

	misc.buildResponse(response, page);

}

/**
 * Builds the edit event page then adds if to the specifed response.
 * 
 * @param response
 *            The response that will be sent to the client.
 * @param event
 *            The event that will be edited.
 * @returns undefined
 */
function build_EditEvent(response, event) {

	var logout = builder.navbarLink("/logout", "Logout");
	var profile = builder.navbarLink("/profile?email=" + user.email, "My Profile");
	var newEvent = builder.navbarLink("/organise", "Orgainse Event");
	var search = builder.navbarLink("/search", "Search Events");
	var home = builder.navbarLink("/", "Home");

	var navbar = builder.navbar([ home, newEvent, search, profile, logout ]);

	var head = builder.head("Event");
	var eventHTML = builder.editEvent(event);
	var body = builder.body(navbar, eventHTML);
	var page = builder.page(head, body);

	misc.buildResponse(response, page);

}

/**
 * Updates the data base with the specied event which should overwrite a current
 * event.
 * 
 * @param event
 *            The updated event.
 * @returns undefined
 */
function updateEvent(event) {

	db.run(
		"UPDATE Events SET name = ?, description = ?, organiser = ?, type = ?, time = ?, location = ?, popularity = ? WHERE event_id = ?;", 
		[event.name, event.description, event.organiser, event.type, event.time, event.location, event.popularity, event.id ]
	);

	console.log("Updated Event: " + event.name);

}

router.get('/', get);
router.get('/edit', get_edit);
router.post('/edit', post_edit);

module.exports = router;