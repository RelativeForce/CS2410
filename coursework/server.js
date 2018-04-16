const port = 80;

// Imported modules
const express = require('express');
const app = express();
const server = app.listen(port, startServer);
const status = require('http-status');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

// My modules
const MD5 = require('./js/MD5');
const db = require('./js/dbHelper');
const builder = require('./js/pageBuilder');
const sessions = require('./js/sessionHelper');
const cookieName = sessions.cookieName;

// GET handlers ---------------------------------------------------------------

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
function get_organise(request, response) {

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
					buildPage(
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
		
							buildResponse(response, page);
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
 * Processes the GET requests to the 'profile' end point which will respond with
 * the profile page provided that the request contains a valid session cookie.
 * 
 * @param request
 *            The request from the client that should contain the session
 *            cookie.
 * @param response
 *            The reponse that will be sent to the client.
 * @returns undefined
 */
function get_profile(request, response) {

	if(request.query.email){
	
		var email = request.query.email;

		db.each(
			"SELECT * FROM Users WHERE email = ?", 
			[email], 
			function(row) {
				
				// Check for the session cookie and wherther it is active.
				var sessionToken = request.cookies[cookieName];
	
				if (sessions.validSession(sessionToken)) {
					sessions.extend(sessionToken, response);
					
					var home = builder.navbarLink("/CS2410/coursework", "Home");
					var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
					var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
					var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
					var myEvents = builder.navbarLink("/CS2410/coursework/events", "My Events");
					
					var navbar = builder.navbar(
						(row.organiser === 'true') ? 
						[ home, newEvent, myEvents, search, logout ] : 
						[ home, search, logout ]
					);
					
					// If the current user owns the profile allow them to edit it.
					profile(request, response, row, "", sessions.getEmail(sessionToken) === email, navbar);
					
				}else{
					
					var login = builder.navbarLink("/CS2410/coursework/login", "Login");
					var home = builder.navbarLink("/CS2410/coursework", "Home");
					var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
					
					var navbar = builder.navbar(
						[ home, login, search ]
					);
					
					profile(request, response, row, "", false, navbar);
				}

			}, 
			function(count) {
			
				// If there is no user with that email redirect to the landing page.
				if (count == 0) {
					response.redirect('/CS2410/coursework');
				}
			}
		);

	} else {
		// No valid session redirect the user to the home screen.
		response.redirect('/CS2410/coursework');
	}

}

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
function get_landing(request, response) {

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

/**
 * Processes the GET requests to the 'login' end point which will respond with
 * the login page.
 * 
 * @param request
 *            Cannot contain a valud session cookie.
 * @param response
 *            The login page.
 * @returns undefined
 */
function get_login(request, response) {
	build_login(request, response, "");
}

/**
 * Processes the GET requests to the 'logout' end point which will redirect to
 * the landing page and end the users session.
 * 
 * @param request
 *            The request from the client that may contain the session cookie.
 * @param response
 *            Redirect the client to the landing page.
 * @returns undefined
 */
function get_logout(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session end it.
	if (sessions.validSession(sessionToken)) {
		sessions.endSession(sessionToken);
	}

	response.clearCookie(cookieName);
	response.redirect('/CS2410/coursework');

}

function get_event(request, response){
	
	if(request.query.event_id){
		
		var event_id = request.query.event_id;

		db.each(
			"SELECT * FROM Events WHERE event_id = ?",
			[event_id], 
			function(eventDetails) {

				db.collect(
					"SELECT * FROM Event_Pictures WHERE event_id = ?", 
					[event_id], 
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
					
						// Check for the session cookie and wherther it is active.
						var sessionToken = request.cookies[cookieName];
						
						// If there is a active session display the event as
						// editable
						if (sessions.validSession(sessionToken)) {
						
							sessions.extend(sessionToken, response);
							
							var email = sessions.getEmail(sessionToken);
	
							db.each(
								"SELECT * FROM Users WHERE email = ?", 
								[email], 
								function(user) {
								
									var isOrganiser = user.organiser === "true";
									
									var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
									var profile = builder.navbarLink("/CS2410/coursework/profile?email=" + user.email, "My Profile");
									var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
									var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
									var home = builder.navbarLink("/CS2410/coursework", "Home");
		
									var navbar = builder.navbar(isOrganiser ? 
											[ home, newEvent, search, profile, logout ] : 
											[ home, search, profile, logout ]);
									
									
									// Pass an whether or not the current user is the
									// event organiser.
									build_event(response, navbar, event, email, isOrganiser);
	
								}, 
								function(userCount) {
									// Do nothing
								}
							);
						
						}else{
							
							var login = builder.navbarLink("/CS2410/coursework/login", "Login");
							var home = builder.navbarLink("/CS2410/coursework", "Home");
	
							var navbar = builder.navbar( [ home, login ]);
							
							// Pass an false as the user is not signed in.
							build_event(response, navbar, event, "", false);
						}
					}
				);
								
		}, function(eventCount) {

			// If there is no event with that id show the landing page.
			if (eventCount == 0) {
				response.redirect('/CS2410/coursework');
			}
		});	
		
	}else{
		response.redirect('/CS2410/coursework');
	}
	
}

function get_events(request, response){
	
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
			
				var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
				var home = builder.navbarLink("/CS2410/coursework", "Home");
				var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
				var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
				var profile = builder.navbarLink("/CS2410/coursework/profile?email=" + email, "My Profile");
	
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
	
						db.each(
							"SELECT * FROM Interest WHERE student_email = ?",
							[email], 
							function(row) {
	
								for(var index = 0; index < events.length; index++){	
									var current = events[index];
							
									if(row.event_id === current.id){
										current.hasLiked = true;
									}	
								}
	
							}, 
							function(interestCount) {
								
								var eventsTable = builder.eventsTable(events, "My Events", true);
	
								var head = builder.head("Aston Events");
								var body = builder.body(navbar, eventsTable);
								var page = builder.page(head, body);
	
								buildResponse(response, page);
							}
						);
					}
				);

			}, 
			function(count) {
			
				// If there is no user with that email show the landing page.
				if (count == 0) {
					response.redirect('/CS2410/coursework');
				}
			}
		);

	} else {
		response.redirect('/CS2410/coursework');
	}
	
	
}

function get_search(request, response){
	
	buildPage(
		'search', 
		function(content) {
		
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

						var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
						var profile = builder.navbarLink("/CS2410/coursework/profile?email=" + user.email, "My Profile");
						var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
						var home = builder.navbarLink("/CS2410/coursework", "Home");
						var myEvents = builder.navbarLink("/CS2410/coursework/events", "My Events");

						var navbar = builder.navbar((user.organiser === 'true') ? 
							[ home, newEvent, myEvents, profile, logout ] : 
							[ home, profile, logout ]);
					
						search(request, response, navbar, true);
					
					}, 
					function(count) {
						
					}
				);

			} else {
			
				var login = builder.navbarLink("/CS2410/coursework/login", "Login");
				var home = builder.navbarLink("/CS2410/coursework", "Home");
				
				var navbar = builder.navbar(
					[ home, login ]
				);
			
				search(request, response, navbar, false);
			}
		}
	);
}

// POST handlers --------------------------------------------------------------

/**
 * Processes POST requests to the 'login' end point which will take a request to
 * log a client in or sign a client up. If the request is valid the client will
 * be redirected to the home page.
 * 
 * @param request
 *            That contains all the details of the login credentials. Passwords
 *            should be hashed before they are sent.
 * @param response
 *            A Redirect to the home page or the login page with the error.
 * @returns undefined
 */
function post_login(request, response) {
	
	// If the request is to log in.
	if (request.body.status === "login") {
		login(request, response);
	} 
	
	// If the request is to sign up
	else if (request.body.status === "signup") {
		signup(request, response);
	}
	
	// Invalid request.
	else{
		response.redirect('/CS2410/coursework');
	}
}

/**
 * Porcesses POST requests to the primary end point which will respond with the
 * home page or landing page depending on whether the response contains valid
 * session cookie.
 * 
 * @param request
 *            The request that may contain details for updating user interest.
 * @param response
 *            The home page or the landing page
 * @returns undefined
 */
function post_landing(request, response){
	
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
			
				updateInterest(request, email);
				
				// If there is a row send the home page of that user.
				home(request, response, user);

			}, 
			function(count) {
			
				// If there is no user with that email show the landing page.
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
function post_organise(request, response) {

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
							changeEventPictures(request, event_id)

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

/**
 * Processes POST requests to the 'profile' ened point which will updated the
 * sessions user's details with the details specifed in the request.
 * 
 * @param request
 *            That contains the updated user details of the for teh session's
 *            user
 * @param response
 *            Either a redirect to the home page if there is not a valid user
 *            session or a profile page with the uspdated user details and a
 *            response box.
 * @returns undefined
 */
function post_profile(request, response) {

	// The session cookie.
	var sessionToken = request.cookies[cookieName];

	// Check for the session cookie and wherther it is active.
	if (sessions.validSession(sessionToken)) {

		sessions.extend(sessionToken, response);
		
		var email = sessions.getEmail(sessionToken);

		// Iterate over the user's details
		db.each(
			"SELECT * FROM Users WHERE email = ?",
			[email],
			function(row) {

				// Change the profile picture
				var newPicture = changePicure(request, response, row);
	
				// Updated the password if there is a new password specified
				var password = row.password;
				if (request.body.password !== "") {
					password = MD5.hash(request.body.password + row.salt);
				}
	
				// The updated user details
				var newRow = {
					"email" : row.email,
					"name" : (row.name !== request.body.name) ? request.body.name : row.name,
					"organiser" : request.body.organiser ? 'true' : 'false',
					"picture" : (newPicture !== row.picture) ? newPicture : row.picture,
					"password" : password,
					"telephone" : (row.telephone !== request.body.telephone) ? request.body.telephone : row.telephone
				};
	
				// Update the user details in the database
				db.run(
					"UPDATE Users SET name = ?, organiser = ?, picture = ?, password = ?, telephone = ?  WHERE email = ?;",
					[newRow.name, newRow.organiser, newRow.picture, newRow.password,	newRow.telephone, newRow.email]
				);

	
				// Build a new info box
				var info = builder.response("Changes Updated");
				
				var home = builder.navbarLink("/CS2410/coursework", "Home");
				var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
				var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
				var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
				var myEvents = builder.navbarLink("/CS2410/coursework/events", "My Events");
				var home = builder.navbarLink("/CS2410/coursework", "Home");
				
				var navbar = builder.navbar(
					(newRow.organiser === 'true') ? 
					[ home, newEvent, myEvents, search, logout ] : 
					[ home, search, logout ]
				);
	
				// Build the profile page with the info box at the top.
				profile(request, response, newRow, info, true, navbar);

		}, 
		function(count) {
			
			// If the user email was invalid.
			if(count == 0){
				response.redirect('/CS2410/coursework');
			}
		});

	} else {
		// If the session was invalid
		response.redirect('/CS2410/coursework');
	}

}

function post_event(request, response){
	
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

					var isOrganiser = false;
					var event_id = request.body.event_id;
					var popularity = 0;
					
					db.each(
						"SELECT * FROM Events WHERE event_id = ?",
						[event_id], 
						function(row) {
							
							// If the event is owned by the current user.
							if(row.organiser === email){
								isOrganiser = true;
							}
							
							popularity = row.popularity;
							
						},
						function(count) {
							
							// If the user has the right to update the event.
							if(isOrganiser){
								
								var event = {
									"name" : encodeHTML(request.body.name),
									"id" : encodeHTML(request.body.event_id),
									"location" : encodeHTML(request.body.location),
									"time" :  encodeHTML(request.body.date + " " + request.body.time),
									"organiser" : encodeHTML(email),
									"description" : encodeHTML(request.body.description),
									"type" : encodeHTML(request.body.type),
									"popularity" : popularity
								};
								
								changeEventPictures(request, event_id);
								updateEvent(event);
								
								response.redirect('/CS2410/coursework/event?event_id=' + event_id + '&type=view');
								
							}else{
								response.redirect('/CS2410/coursework');
							}
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

// Misc functions -------------------------------------------------------------

function buildResponse(response, page){
	
	response.writeHead(200, {
		'Content-Type' : 'text/html'
	});
	response.write(page);
	response.end();
	
}

function updateInterest(request, email){
	
	var event_id = request.body.event_id;
	var type = request.body.type;

	if(event_id && type){
		
		if(type === "like"){
			
			db.run(
				"INSERT INTO Interest(event_id, student_email) VALUES (?, ?);", 
				[event_id, email]
			);
			
			db.run(
				"UPDATE Events SET popularity = popularity + 1  WHERE event_id = ?;",
				[event_id]
			);

			console.log("Interest update: " + email + " liked event " + event_id);
			
		}else if(type === "unlike"){
			
			db.run(
				"DELETE FROM Interest WHERE event_id = ? AND student_email = ?;",
				[event_id, email]
			);
			
			db.run(
				"UPDATE Events SET popularity = popularity - 1  WHERE event_id = ?;", 
				[event_id]
			);
			
			console.log("Interest update: " + email + " unliked event " + event_id);
		}
	}
}

function build_event(response, navbar, event, email, isAnOrganiser){
	
	// Builds the student login page
	buildPage('event', function(content) {
	
		var head = builder.head("Event");
		var eventHTML = builder.event(event, event.organiser === email);
		var body = builder.body(navbar, eventHTML + content);
		var page = builder.page(head, body);

		buildResponse(response, page);

	});
	
}

function addEvent(request, email, event_id){
	
	var event = {
		"name" : encodeHTML(request.body.name),
		"id" : encodeHTML(event_id),
		"location" : encodeHTML(request.body.location),
		"time" : encodeHTML(request.body.date + " " + request.body.time),
		"organiser" : encodeHTML(email),
		"description" : encodeHTML(request.body.description),
		"type" : encodeHTML(request.body.type),
		"popularity" : 0
	};

	db.run(
		"INSERT INTO Events (event_id, name, description, organiser, type, time, location, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
		[event.id, event.name, event.description, event.organiser, event.type, event.time, event.location, event.popularity]
	);
	
	console.log("New Event: " + event.name);
	
}

function updateEvent(event){
	
	db.run(
		"UPDATE Events SET name = ?, description = ?, organiser = ?, type = ?, time = ?, location = ?, popularity = ? WHERE event_id = ?;", 
		[event.name, event.description, event.organiser, event.type, event.time, event.location, event.popularity, event.id]
	);
		
	console.log("Updated Event: " + event.name);

}

function changeEventPictures(request, event_id){
	
	var files = request.files;
	
	if(request.body.pName0 && request.body.pName0 !== ""){
		swapPicture(event_id, files, encodeHTML(request.body.pName0), '0');
	}

	if(request.body.pName1 && request.body.pName1 !== ""){
		swapPicture(event_id, files, encodeHTML(request.body.pName1), '1');
	}

	if(request.body.pName2 && request.body.pName2 !== ""){
		swapPicture(event_id, files, encodeHTML(request.body.pName2), '2');
	}

	if(request.body.pName3 && request.body.pName3 !== ""){
		swapPicture(event_id, files, encodeHTML(request.body.pName3), '3');
	}
	
}

function swapPicture(event_id, files, specificFile, pictureNum){
	
	var picture = 'none';

	// Iterate over all the pictures with the specifed event id
	db.each(
		"SELECT * FROM Event_Pictures WHERE event_id = ?", 
		[event_id], 
		function(row) {
		
			// If the current name is the name of the first image regardless of file
			// extension.
			if(row.picture.split('.')[0] === ('e_' + event_id + '_' + pictureNum)){
				picture = row.picture;
			}
		}, 
		function(count) {
		
			if(count != 0 && picture !== 'none' ){
				deletePicture(picture);
			}
		
			// For all of the files the user wants to input
			for(var f in files){
				
				var file = files[f];	
				var filename = file.name;
				
				// If the current file is the file for the current slot.
				if(filename === specificFile){
					
					var ext = path.extname(filename).toLowerCase();
					var newFilename = 'e_' + event_id + "_" + pictureNum + ext;
					var relativePath = './public/uploaded/' + newFilename;
	
					// If the image is the valid file type
					if (ext === '.png' || ext === '.jpg') {
	
						// Move the file
						file.mv(relativePath, function(err) {
							if (err) {
								throw err;
							}
						});
						
						// Insert the entry into the database
						insertPicture(event_id, filename, newFilename);
						
					}	
				}
			}
		}
	);
	
}

function deletePicture(picture){
	
	var toDelete = path.resolve('./public/uploaded/' + picture);
	if (fs.existsSync(toDelete)) {
		fs.unlinkSync(toDelete);
	}
	
	db.run(
		"DELETE FROM Event_Pictures WHERE picture = ?;", 
		[picture] 
	);
	
	console.log('Deleted: ' + picture);
	
}

function insertPicture(event_id, filename, newFilename){
	
	db.run(
		"INSERT INTO Event_Pictures(picture, event_id) VALUES (?, ?);",
		[newFilename, event_id]
	);
	
	console.log('Uploaded: ' + filename + ' -> ' + newFilename);
	
}

function home(request, response, user) {

	// Construct the student home page
	buildPage(
		'home', 
		function(content) {

			var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
			var profile = builder.navbarLink("/CS2410/coursework/profile?email=" + user.email, "My Profile");
			var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
			var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
			var myEvents = builder.navbarLink("/CS2410/coursework/events", "My Events");

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

							buildResponse(response, page);
						}
					);
				}
			);	
		}
	);

}

function landing(request, response) {

	// Construct the landing page
	buildPage('landing', function(content) {	

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
			
			var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
			var login = builder.navbarLink("/CS2410/coursework/login", "Login");
			var navbar = builder.navbar([ login, search ]);
			
			var eventsTable = builder.eventsTable(events, "All Events", false);

			var head = builder.head("Aston Events");
			var body = builder.body(navbar, content + eventsTable);
			var page = builder.page(head, body);

			buildResponse(response, page);
			
		});
		
	});
	
}

function search(request, response, navbar, signedIn){
	
	// Defalut order by date decsending 
	var queryText =  "SELECT * FROM Events ORDER BY DATE(time) DESC";
	var params = [];
	var filter = {
		"by" : "date",
		"from" : "",
		"to" : ""
	};
	
	if(request.query.filter){
		
		// The filter is by date
		if(request.query.filter === "Date"){
			
			// The params for the date filter
			var from = request.query.from;
			var to = request.query.to;
			
			// The validity of the params
			var validFrom = (from) && (from !== "");
			var validTo = (to) && (to !== "");
			
			// If the user has specified a from and to
			if(validFrom && validTo){
				
				queryText =  "SELECT * FROM Events WHERE DATE(time) BETWEEN DATE(?) AND DATE(?) ORDER BY DATE(time) DESC;";
				params = [from, to];
				filter = {
					"by" : "date", 
					"from" : from,
					"to" : to
				};
				
			}else if(validFrom){
				
				queryText =  "SELECT * FROM Events WHERE DATE(time) >= DATE(?) ORDER BY DATE(time) DESC;";
				params = [from];
				filter = {
					"by" : "date", 
					"from" : from,
					"to" : ""
				};
				
			}else if(validTo){
				
				queryText =  "SELECT * FROM Events WHERE DATE(time) <= DATE(?) ORDER BY DATE(time) DESC;";
				params = [to];
				filter = {
					"by" : "date", 
					"from" : "",
					"to" : to
				};
				
			}else{
				// Use default filter
			}
		}
		// Filter by Type
		else if(request.query.filter === "Type"){
			
			var type = request.query.type;
			
			var validType = (type) && (type !== "");
			
			if(validType){
				
				queryText =  "SELECT * FROM Events WHERE type = ? ORDER BY DATE(time) DESC;";
				params = [type];
				filter = {
					"by" : "type", 
					"type" : type
				};
				
			}else{
				// Use default filter
			}
			
			
		}
		// Filter by Popularity
		else if(request.query.filter === "Popularity"){
			
			var minimum = request.query.minimum;
			
			var validMinimum = (minimum) && (minimum !== "");
			
			if(validMinimum){
				
				queryText =  "SELECT * FROM Events WHERE popularity >= ? ORDER BY popularity DESC;";
				params = [minimum];
				filter = {
					"by" : "popularity", 
					"minimum" : minimum
				};
				
			}else{
				
				queryText =  "SELECT * FROM Events ORDER BY popularity DESC;";
				params = [minimum];
				filter = {
					"by" : "popularity", 
					"minimum" : ""
				};	
			}			
		}
	}
	
	
	db.collect(
		queryText,
		params, 
		function(rawEvent){
		
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
		}, 
		function(events){
		
			buildPage(
				'search', 
				function(content) {
			
					var eventsTable = builder.eventsTable(events, "Results", signedIn);
					var search = builder.search(filter);

					var head = builder.head("Search");
					var body = builder.body(navbar, content + search + eventsTable);
					var page = builder.page(head, body);

					buildResponse(response, page);
			
				}
			);
		}
	);
		
}

function changePicure(request, response, row) {
	
	// If no file was uploaded then there is no change.
	if (!request.files.picture) {
		return row.picture;
	}

	var pictureName = row.email.split("@")[0];
	var file = request.files.picture;
	var ext = path.extname(file.name).toLowerCase();
	var newFilename = 'pp_' + pictureName + ext;
	var relativePath = './public/uploaded/' + newFilename;

	if (ext === '.png' || ext === '.jpg') {

		// If there is a current picture attempt to delete it.
		if (row.picture !== 'none') {

			var toDelete = path.resolve('./public/uploaded/' + row.picture);

			if (fs.existsSync(toDelete)) {

				console.log('Exists: ' + toDelete);
				fs.unlinkSync(toDelete);
			}
		}

		file.mv(relativePath, function(err) {
			if (err) {
				throw err;
			} else {
				console.log('Uploaded: ' + file.name + ' -> ' + newFilename);
			}
		});

		return newFilename;
	}

	return row.picture;

}

function startServer() {

	console.log('Listening on port ' + port);

	db.connect();

}

function login(request, response) {

	// Sterilise the username and password
	var email = encodeHTML(request.body.email);
	var password = encodeHTML(request.body.password);

	db.each(
		"SELECT * FROM Users WHERE email = ?",
		[email], 
		function(row) {

			var salted = MD5.hash(password + row.salt);
	
			if (salted === row.password) {
	
				var token = sessions.uniqueToken();
	
				// If the session is added redirct the client.
				if (sessions.addSession(token, email)) {
					sessions.extend(token, response);
					response.redirect('/CS2410/coursework');
				} else {
					// Session alread exists.
					var error = builder.error("Session exists elsewhere. Please sign out in the other location.");
					build_login(request, response, error);
				}
			} else {
	
				// Invalid password
				var error = builder.error("Password is incorrect.");
				build_login(request, response, error);
			}

		}, 
		function(count) {
		
			// Invalid email
			if (count == 0) {
				var error = builder.error("<strong>" + email + "</strong> is not a valid email.");
				build_login(request, response, error);
			}
		}
	);

}

function build_login(request, response, error) {

	// Builds the student login page
	buildPage('login', function(content) {

		var home = builder.navbarLink("/CS2410/coursework", "Home");
		var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
		
		var navbar = builder.navbar([ home, search ]);
		var head = builder.head("Login");
		var body = builder.body(navbar, error + content);
		var page = builder.page(head, body);

		buildResponse(response, page);

	});

}

function signup(request, response) {

	var salt = generateSalt();
	var email = encodeHTML(request.body.email);
	var password = encodeHTML(request.body.password);
	var name = encodeHTML(request.body.name);
	var dob = encodeHTML(request.body.dob);
	var telephone = encodeHTML(request.body.telephone);
	var picture = "none";

	var saltedPassword = MD5.hash(password + salt);

	db.each(
		"SELECT * FROM Users WHERE email = ?",
		[email], 
		function(row) {
			// Count elements
		},
		function(count) {
	
			// User does not exist already
			if (count == 0) {
	
				db.run(
					"INSERT INTO Users('email', 'name', 'dob', 'organiser' ,'picture','password', 'salt', 'telephone') VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
					[email, name, dob, 'false', picture, saltedPassword, salt, telephone]
				);
	
				console.log("User created: [" + email + ", " + name + ", " + dob + ", false, " + picture + ", " + saltedPassword + ", " + salt + ", " + telephone + "]");
	
				var token = sessions.uniqueToken();
	
				sessions.addSession(token, email);
				sessions.extend(token, response);
				response.redirect('/CS2410/coursework');
	
			} else {
	
				var error = builder.error("A user with Email: <strong>"+ email+ "</strong> already exists.");
				build_login(request, response, error);
	
			}
		}
	);
}

function profile(request, response, user, info, canEdit, navbar) {

	// Construct the organiser home page
	buildPage('profile', function(content) {

		var profile = builder.profile(user, canEdit);

		var head = builder.head("Profile");
		var body = builder.body(navbar, info + profile + content);
		var page = builder.page(head, body);

		buildResponse(response, page);

	});

}

function encodeHTML(html) {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g,
			'&quot;');
}

/**
 * This reads the specifed content file then preforms the specifed call back
 * function which should have one parameter which will be the contents of the
 * specifed file.
 */
function buildPage(contentFile, callback) {

	fs.readFile(path.join(__dirname, 'components/' + contentFile + '.html'),
			function(err, content) {
				if (err) {
					throw err;
				}
				callback(content);
			});
}

function generateSalt() {

	const saltLength = 30;

	var salt = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < saltLength; i++) {
		salt += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return salt;
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.get('/CS2410/coursework', get_landing);
app.get('/CS2410/coursework/login', get_login);
app.get('/CS2410/coursework/logout', get_logout);
app.get('/CS2410/coursework/profile', get_profile);
app.get('/CS2410/coursework/organise', get_organise);
app.get('/CS2410/coursework/event', get_event);
app.get('/CS2410/coursework/events', get_events);
app.get('/CS2410/coursework/search', get_search);

app.post('/CS2410/coursework', post_landing);
app.post('/CS2410/coursework/login', post_login);
app.post('/CS2410/coursework/profile', post_profile);
app.post('/CS2410/coursework/organise', post_organise);
app.post('/CS2410/coursework/event', post_event);
