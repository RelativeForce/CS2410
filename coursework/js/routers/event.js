const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const db = require('./../modules/dbHelper');
const builder = require('./../modules/pageBuilder');
const sessions = require('./../modules/sessionHelper');
const misc = require('./../modules/misc');
const cookieName = sessions.cookieName;

function get(request, response) {

	if (request.query.event_id) {

		var event_id = request.query.event_id;

		db
				.each(
						"SELECT * FROM Events WHERE event_id = ?",
						[ event_id ],
						function(eventDetails) {

							db
									.collect(
											"SELECT * FROM Event_Pictures WHERE event_id = ?",
											[ event_id ],
											function(pictureEntry) {
												return pictureEntry.picture;
											},
											function(pictures) {

												var event = {
													"event_id" : eventDetails.event_id,
													"name" : eventDetails.name,
													"description" : eventDetails.description,
													"organiser" : eventDetails.organiser,
													"type" : eventDetails.type,
													"time" : eventDetails.time,
													"location" : eventDetails.location,
													"popularity" : eventDetails.popularity,
													"pictures" : pictures
												};

												// Check for the session cookie
												// and wherther it is active.
												var sessionToken = request.cookies[cookieName];

												// If there is a active session
												// display the event as
												// editable
												if (sessions
														.validSession(sessionToken)) {

													sessions.extend(
															sessionToken,
															response);

													var email = sessions
															.getEmail(sessionToken);

													db
															.each(
																	"SELECT * FROM Users WHERE email = ?",
																	[ email ],
																	function(
																			user) {

																		var isOrganiser = event.organiser === email;

																		var logout = builder
																				.navbarLink(
																						"/CS2410/coursework/logout",
																						"Logout");
																		var profile = builder
																				.navbarLink(
																						"/CS2410/coursework/profile?email="
																								+ user.email,
																						"My Profile");
																		var newEvent = builder
																				.navbarLink(
																						"/CS2410/coursework/organise",
																						"Orgainse Event");
																		var search = builder
																				.navbarLink(
																						"/CS2410/coursework/search",
																						"Search Events");
																		var home = builder
																				.navbarLink(
																						"/CS2410/coursework",
																						"Home");

																		var navbar = builder
																				.navbar(isOrganiser ? [
																						home,
																						newEvent,
																						search,
																						profile,
																						logout ]
																						: [
																								home,
																								search,
																								profile,
																								logout ]);

																		// Pass
																		// an
																		// whether
																		// or
																		// not
																		// the
																		// current
																		// user
																		// is
																		// the
																		// event
																		// organiser.
																		build_ViewEvent(
																				response,
																				navbar,
																				event,
																				isOrganiser);

																	},
																	function(
																			userCount) {
																		// Do
																		// nothing
																	});

												} else {

													var login = builder
															.navbarLink(
																	"/CS2410/coursework/login",
																	"Login");
													var home = builder
															.navbarLink(
																	"/CS2410/coursework",
																	"Home");

													var navbar = builder
															.navbar([ home,
																	login ]);

													// Pass an false as the user
													// is not signed in.
													build_ViewEvent(response,
															navbar, event,
															false);
												}
											});

						}, function(eventCount) {

							// If there is no event with that id show the
							// landing page.
							if (eventCount == 0) {
								response.redirect('/CS2410/coursework');
							}
						});

	} else {
		response.redirect('/CS2410/coursework');
	}

}

function post_edit(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session build the nav bar with the user options
	if (sessions.validSession(sessionToken)) {

		sessions.extend(sessionToken, response);

		var email = sessions.getEmail(sessionToken);

		db
				.each(
						"SELECT * FROM Users WHERE email = ?",
						[ email ],
						function(user) {

							// If the user is not a organiser.
							if (user.organiser !== 'true') {
								response.redirect('/CS2410/coursework');
							} else {

								var isOrganiser = false;
								var event_id = request.body.event_id;
								var popularity = 0;

								db
										.each(
												"SELECT * FROM Events WHERE event_id = ?",
												[ event_id ],
												function(row) {

													// If the event is owned by
													// the current user.
													if (row.organiser === email) {
														isOrganiser = true;
													}

													popularity = row.popularity;

												},
												function(count) {

													// If the user has the right
													// to update the event.
													if (isOrganiser) {

														var event = {
															"name" : misc
																	.encodeHTML(request.body.name),
															"id" : misc
																	.encodeHTML(request.body.event_id),
															"location" : misc
																	.encodeHTML(request.body.location),
															"time" : misc
																	.encodeHTML(request.body.date
																			+ " "
																			+ request.body.time),
															"organiser" : misc
																	.encodeHTML(email),
															"description" : misc
																	.encodeHTML(request.body.description),
															"type" : misc
																	.encodeHTML(request.body.type),
															"popularity" : popularity
														};

														misc
																.changeEventPictures(
																		request,
																		event_id);
														updateEvent(event);

														response
																.redirect('/CS2410/coursework/event?event_id='
																		+ event_id);

													} else {
														response
																.redirect('/CS2410/coursework');
													}
												});
							}
						}, function(count) {

							// If there is no user with that email.
							if (count == 0) {
								response.redirect('/CS2410/coursework');
							}
						});

	} else {
		response.redirect('/CS2410/coursework');
	}

}

function get_edit(request, response) {

	if (request.query.event_id) {

		var event_id = request.query.event_id;

		db
				.each(
						"SELECT * FROM Events WHERE event_id = ?",
						[ event_id ],
						function(eventDetails) {

							db
									.collect(
											"SELECT * FROM Event_Pictures WHERE event_id = ?",
											[ event_id ],
											function(pictureEntry) {
												return pictureEntry.picture;
											},
											function(pictures) {

												var event = {
													"event_id" : eventDetails.event_id,
													"name" : eventDetails.name,
													"description" : eventDetails.description,
													"organiser" : eventDetails.organiser,
													"type" : eventDetails.type,
													"time" : eventDetails.time,
													"location" : eventDetails.location,
													"popularity" : eventDetails.popularity,
													"pictures" : pictures
												};

												// Check for the session cookie
												// and wherther it is active.
												var sessionToken = request.cookies[cookieName];

												// If there is a active session
												// display the event as
												// editable
												if (sessions
														.validSession(sessionToken)) {

													sessions.extend(
															sessionToken,
															response);

													var email = sessions
															.getEmail(sessionToken);

													db
															.each(
																	"SELECT * FROM Users WHERE email = ?",
																	[ email ],
																	function(
																			user) {

																		var logout = builder
																				.navbarLink(
																						"/CS2410/coursework/logout",
																						"Logout");
																		var profile = builder
																				.navbarLink(
																						"/CS2410/coursework/profile?email="
																								+ user.email,
																						"My Profile");
																		var newEvent = builder
																				.navbarLink(
																						"/CS2410/coursework/organise",
																						"Orgainse Event");
																		var search = builder
																				.navbarLink(
																						"/CS2410/coursework/search",
																						"Search Events");
																		var home = builder
																				.navbarLink(
																						"/CS2410/coursework",
																						"Home");

																		if (event.organiser === email) {

																			var navbar = builder
																					.navbar([
																							home,
																							newEvent,
																							search,
																							profile,
																							logout ]);

																			// Pass
																			// an
																			// whether
																			// or
																			// not
																			// the
																			// current
																			// user
																			// is
																			// the
																			// event
																			// organiser.
																			build_EditEvent(
																					response,
																					navbar,
																					event);

																		} else {
																			response
																					.redirect('/CS2410/coursework/event?event_id='
																							+ event_id);
																		}

																	},
																	function(
																			userCount) {
																		// Do
																		// nothing

																	});

												} else {
													response
															.redirect('/CS2410/coursework/event?event_id='
																	+ event_id);
												}
											});

						}, function(eventCount) {

							// If there is no event with that id show the
							// landing page.
							if (eventCount == 0) {
								response.redirect('/CS2410/coursework');
							}
						});

	} else {
		response.redirect('/CS2410/coursework');
	}

}

function build_ViewEvent(response, navbar, event, canEdit) {

	// Builds the student login page
	misc.buildPage('event', function(content) {

		var head = builder.head("Event");
		var eventHTML = builder.viewEvent(event, canEdit);
		var body = builder.body(navbar, eventHTML + content);
		var page = builder.page(head, body);

		misc.buildResponse(response, page);

	});

}

function build_EditEvent(response, navbar, event) {

	// Builds the student login page
	misc.buildPage('event', function(content) {

		var head = builder.head("Event");
		var eventHTML = builder.editEvent(event);
		var body = builder.body(navbar, eventHTML + content);
		var page = builder.page(head, body);

		misc.buildResponse(response, page);

	});

}

function updateEvent(event) {

	db
			.run(
					"UPDATE Events SET name = ?, description = ?, organiser = ?, type = ?, time = ?, location = ?, popularity = ? WHERE event_id = ?;",
					[ event.name, event.description, event.organiser,
							event.type, event.time, event.location,
							event.popularity, event.id ]);

	console.log("Updated Event: " + event.name);

}

router.get('/', get);
router.get('/edit', get_edit);
router.post('/edit', post_edit);

module.exports = router;