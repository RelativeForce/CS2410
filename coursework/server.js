const port = 3000;
const cookieName = 'AstonEvents';

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
const sqlite3 = require('sqlite3').verbose();

// My modules
const MD5 = require('./public/MD5');
const dbHelper = require('./js/dbHelper');
const builder = require('./js/pageBuilder');
const sessions = require('./js/sessionHelper');

/**
 * Holds the connection to the SQLite database.
 */
var database;

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

		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query.each(email, function(err, row) {

			// If the user is not an organiser redirect them to the home page.
			if (row.organiser !== 'true') {
				response.redirect('/CS2410/coursework');
			} else {

				// Construct the organiser home page
				buildPage('organise', function(content) {

					// The elements of the organise page.
					var home = builder.navbarLink("/CS2410/coursework", "Home");
					var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
					var profile = builder.navbarLink("/CS2410/coursework/profile","My Profile");
					var search = builder.navbarLink("/CS2410/coursework/search","Search Events");
					var myEvents = builder.navbarLink("/CS2410/coursework/events","My Events");
					var navbar = builder.navbar([ home, profile, myEvents, search, logout ]);
					var head = builder.head("Aston Events");
					var body = builder.body(navbar, content);
					
					// The string representation of the page as HTML
					var page = builder.page(head, body);

					// The attributes of the response.
					var responseAttributes = {
						'Content-Type' : 'text/html'
					};
					
					response.writeHead(200, responseAttributes);
					response.write(page);
					response.end();

				});

			}

		}, function(err, count) {
			query.finalize();

			// If there is no user with that email.
			if (count == 0) {
				response.redirect('/CS2410/coursework');
			}
		});

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

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a valid session show the users profile.
	if (sessions.validSession(sessionToken)) {

		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query.each(email, function(err, row) {

			profile(request, response, row, "");

		}, function(err, count) {
			query.finalize();

			// If there is no user with that email redirect to the landing page.
			if (count == 0) {
				response.redirect('/CS2410/coursework');
			}
		});

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
		
		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query.each(email, function(error, user) {
			
			// If there is a row send the home page of that user.
			home(request, response, user);

		}, function(err, count) {
			query.finalize();

			// If there is no user with that email show the landing
			// page.
			if (count == 0) {
				landing(request, response);
			}
		});

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
		
		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query.each(email, function(error, user) {
			
			updateInterest(request, email);
			
			// If there is a row send the home page of that user.
			home(request, response, user);

		}, function(err, count) {
			query.finalize();

			// If there is no user with that email show the landing
			// page.
			if (count == 0) {
				landing(request, response);
			}
		});

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

		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query.each(
			email,
			function(err, user) {

				// If the user is not a organiser.
				if (user.organiser !== 'true') {
					response.redirect('/CS2410/coursework');
				} else {

					var eventQuery = database.prepare("SELECT * FROM Events");

					eventQuery.each(
						function(err, row) {
							// Count the results
						},
						function(err, count) {
							eventQuery.finalize();
							
							// TEMP ID GENTERATION!!!!!
							var event_id = count;
								
							// Add event and pictures to the database
							addEvent(request, email, event_id);	
							addEventPictures(request.files, event_id)

							response.redirect('/CS2410/coursework/event?id=' + event_id);
						}
					);
				}
			}, 
			function(err, count) {
				query.finalize();

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

		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		// Iterate over the user's details
		query.each(email,function(err, row) {

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
			var update = database.prepare("UPDATE Users SET name = ?, organiser = ?, picture = ?, password = ?, telephone = ?  WHERE email = ?;");
			update.run([newRow.name, newRow.organiser, newRow.picture, newRow.password,	newRow.telephone, newRow.email]);
			update.finalize();

			// Build a new info box
			var info = builder.response("Changes Updated");

			// Build the profile page with the info box at the top.
			profile(request, response, newRow, info);

		}, 
		function(err, count) {
			query.finalize();
			
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

// Misc functions -------------------------------------------------------------

function updateInterest(request, email){
	
	var event_id = request.body.event_id;
	var like = request.body.like;

	if(event_id && like){
		
		if(like === "true"){
			
			var addInterest = database.prepare("INSERT INTO Interest(event_id, student_email) VALUES (?, ?);");
			addInterest.run([event_id, email]);
			addInterest.finalize();
			
			var increasePopularity = database.prepare("UPDATE Events SET popularity = popularity + 1  WHERE event_id = ?;");
			increasePopularity.run([event_id]);
			increasePopularity.finalize();
			
			console.log("Interest update: " + email + " liked event " + event_id);
			
		}else if(like === "false"){
			
			var removeInterest = database.prepare("DELETE FROM Interest WHERE event_id = ? AND student_email = ?;");
			removeInterest.run([event_id, email]);
			removeInterest.finalize();
			
			var decreasePopularity = database.prepare("UPDATE Events SET popularity = popularity - 1  WHERE event_id = ?;");
			decreasePopularity.run([event_id]);
			decreasePopularity.finalize();
			
			console.log("Interest update: " + email + " unliked event " + event_id);
		}
	}
}

function addEvent(request, email, event_id){
	
	var event = {
		"name" : request.body.name,
		"id" : event_id,
		"location" : request.body.location,
		"time" : request.body.time,
		"organiser" : email,
		"description" : request.body.description,
		"type" : request.body.type,
		"popularity" : 0
	};

	var add = database.prepare("INSERT INTO Events (event_id, name, description, organiser, type, time, location, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);");
	add.run([event.id, event.name, event.description, event.organiser, event.type, event.time, event.location, event.popularity]);
	add.finalize();
	
	console.log("New Event: " + event.name);
	
}

function addEventPictures(files, event_id){
		
	var query = database.prepare("SELECT * FROM Event_Pictures WHERE event_id = ?");

	// Iterate over all the pictures with the specifed event id and count them
	query.each(event_id, function(err, row) {
		// Count number of event images
	}, function(err, count) {
			
		query.finalize();
		
		var index = 0;
		
		// For all of the files the user wants to input
		for(var f in files){
			
			var file = files[f];	
			var filename = file.name;
			var ext = path.extname(filename).toLowerCase();
			var newFilename = 'e_' + event_id + "_" + (count + index) + ext;
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
			
			index += 1;
		}
	});
}

function insertPicture(event_id, filename, newFilename){
	
	var addPicture = database.prepare("INSERT INTO Event_Pictures(picture, event_id) VALUES (?, ?);");
	addPicture.run([newFilename, event_id]);
	addPicture.finalize();
	
	console.log('Uploaded: ' + filename + ' -> ' + newFilename);
	
}

function home(request, response, user) {

	// Construct the student home page
	buildPage('home', function(content) {

		var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
		var profile = builder.navbarLink("/CS2410/coursework/profile",
				"My Profile");
		var newEvent = builder.navbarLink("/CS2410/coursework/organise",
				"Orgainse Event");
		var search = builder.navbarLink("/CS2410/coursework/search",
				"Search Events");
		var myEvents = builder.navbarLink("/CS2410/coursework/events",
				"My Events");

		var navbar = (user.organiser === 'true') ? builder.navbar([ newEvent,
				myEvents, search, profile, logout ]) : builder.navbar([ search,
				profile, logout ]);
		
		var eventQuery = database.prepare("SELECT * FROM Events");

		var events = [];

		eventQuery.each(function(eventError, row) {

			var event = {
				"name" : row.name,
				"id" : row.event_id,
				"location" : row.location,
				"time" : row.time,
				"organiser" : row.organiser,
				"hasLiked" : false
			};

			events.push(event);

		}, function(eventError, eventCount) {
			eventQuery.finalize();
			
			var interestQuery = database.prepare("SELECT * FROM Interest WHERE student_email = ?");

			interestQuery.each(user.email, function(interestError, row) {

				for(var index = 0; index < events.length; index++){	
					var current = events[index];
					
					if(row.event_id === current.id){
						current.hasLiked = true;
					}	
				}

			}, function(interestError, interestCount) {
				interestQuery.finalize();

				var eventsTable = builder.eventsTable(events, "Upcoming Events");

				var head = builder.head("Aston Events");
				var body = builder.body(navbar, content + eventsTable);
				var page = builder.page(head, body);

				response.writeHead(200, {
					'Content-Type' : 'text/html'
				});
				response.write(page);
				response.end();


			});
		});
	});

}

function landing(request, response) {

	// Construct the landing page
	buildPage('landing', function(content) {

		var login = builder.navbarLink("/CS2410/coursework/login", "Login");
		var navbar = builder.navbar([ login ]);

		var head = builder.head("Aston Events");
		var body = builder.body(navbar, content);
		var page = builder.page(head, body);

		response.writeHead(200, {
			'Content-Type' : 'text/html'
		});
		response.write(page);
		response.end();

	});

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

	// Connect to the database.
	database = new sqlite3.Database('./db/aston_events.sqlite3',
			sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function(err) {
				if (err){
					console.log(err.message);
				}});

	// dbHelper.users(database);
	// dbHelper.events(database);
	// dbHelper.interest(database);
	// dbHelper.pictures(database);

	// database.run("DROP TABLE Interest");

}

function login(request, response) {

	// Sterilise the username and password
	var email = encodeHTML(request.body.email);
	var password = encodeHTML(request.body.password);

	var query = database.prepare("SELECT * FROM Users WHERE email = ?");

	query.each(email, function(err, row) {

		var salted = MD5.hash(password + row.salt);

		if (salted === row.password) {

			var token = sessions.uniqueToken();

			// If the session is added redirct the client.
			if (sessions.addSession(token, email)) {
				response.cookie(cookieName, token, {
					maxAge : 999999
				});
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

	}, function(err, count) {
		query.finalize();

		// Invalid email
		if (count == 0) {
			var error = builder.error("<strong>" + email + "</strong> is not a valid email.");
			build_login(request, response, error);
		}
	});

}

function build_login(request, response, error) {

	// Builds the student login page
	buildPage('login', function(content) {

		var home = builder.navbarLink("/CS2410/coursework", "Home");
		var navbar = builder.navbar([ home ]);
		var head = builder.head("Login");
		var body = builder.body(navbar, error + content);
		var page = builder.page(head, body);

		response.writeHead(200, {
			'Content-Type' : 'text/html'
		});
		response.write(page);
		response.end();

	});

}

function signup(request, response) {

	var salt = generateSalt();
	var email = request.body.email;
	var password = request.body.password;
	var name = request.body.name;
	var dob = request.body.dob;
	var telephone = request.body.telephone;
	var picture = "none";

	var saltedPassword = MD5.hash(password + salt);

	var query = database.prepare("SELECT * FROM Users WHERE email = ?");

	query.each(email, function(err, row) {
		// Count elements
	},
	function(err, count) {
		query.finalize();

		// User does not exist already
		if (count == 0) {

			var insert = database.prepare("INSERT INTO Users('email', 'name', 'dob', 'organiser' ,'picture','password', 'salt', 'telephone') VALUES (?, ?, ?, ?, ?, ?, ?, ?);");
			insert.run([ email, name, dob, 'false', picture, saltedPassword, salt, telephone ]);
			insert.finalize();

			console.log("User created: [" + email + ", " + name + ", " + dob + ", false, " + picture + ", " + saltedPassword + ", " + salt + ", " + telephone + "]");

			var token = sessions.uniqueToken();

			sessions.addSession(token, email);
			response.cookie(cookieName, token, {
				maxAge : 999999
			});
			response.redirect('/CS2410/coursework');

		} else {

			var error = builder.error("A user with Email: <strong>"+ email+ "</strong> already exists.");
			build_login(request, response, error);

		}
	});
}

function profile(request, response, user, info) {

	// Construct the organiser home page
	buildPage('profile', function(content) {

		var home = builder.navbarLink("/CS2410/coursework", "Home");
		var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
		var newEvent = builder.navbarLink("/CS2410/coursework/organise",
				"Orgainse Event");
		var search = builder.navbarLink("/CS2410/coursework/search",
				"Search Events");
		var myEvents = builder.navbarLink("/CS2410/coursework/events",
				"My Events");

		var navbar = builder
				.navbar((user.organiser === 'true') ? [ home, newEvent,
						myEvents, search, logout ] : [ home, search, logout ]);

		var profile = builder.profile(user);

		var head = builder.head("Aston Events");
		var body = builder.body(navbar, info + profile + content);
		var page = builder.page(head, body);

		response.writeHead(200, {
			'Content-Type' : 'text/html'
		});
		response.write(page);
		response.end();

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());

app.get('/CS2410/coursework', get_landing);
app.get('/CS2410/coursework/login', get_login);
app.get('/CS2410/coursework/logout', get_logout);
app.get('/CS2410/coursework/profile', get_profile);
app.get('/CS2410/coursework/organise', get_organise);

app.post('/CS2410/coursework', post_landing);
app.post('/CS2410/coursework/login', post_login);
app.post('/CS2410/coursework/profile', post_profile);
app.post('/CS2410/coursework/organise', post_organise);
