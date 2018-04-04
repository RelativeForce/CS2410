const port = 3000;
const cookieName = 'AstonEvents';

// Import requestuired packages
const express = require('express');
const status = require('http-status');
const path = require('path');
const fs = require('fs');
const app = express();
const dbHelper = require('./js/dbHelper');
const builder = require('./js/pageBuilder');
const sessions = require('./js/sessionHelper');
const MD5 = require('./public/MD5');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const server = app.listen(port, startServer);
const fileUpload = require('express-fileupload');

var database;

function get_organise(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session build the nav bar with the user options
	if (sessions.validSession(sessionToken)) {

		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query.each(email, function(err, row) {

			if (row.organiser !== 'true') {
				response.sendStatus(500);
			} else {

				// Construct the organiser home page
				buildPage('organise', function(content) {

					var home = builder.navbarLink("/CS2410/coursework", "Home");
					var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
					var profile = builder.navbarLink("/CS2410/coursework/profile","My Profile");
					var search = builder.navbarLink("/CS2410/coursework/search","Search Events");
					var myEvents = builder.navbarLink("/CS2410/coursework/events","My Events");

					var navbar = builder.navbar([ home, profile, myEvents, search, logout ]);

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

		}, function(err, count) {
			query.finalize();

			// If there is no user with that email.
			if (count == 0) {
				response.sendStatus(500);
			}
		});

	} else {
		response.sendStatus(500);
	}

}

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

				if (user.organiser !== 'true') {
					response.sendStatus(500);
				} else {

					var eventQuery = database.prepare("SELECT * FROM Events");

					eventQuery.each(
						function(err, row) {
							// Count the results
						},
						function(err, count) {

							// TEMP ID GENTERATION!!!!!
							var event_id = count;
								
							addEvent(request, email, event_id);
												
							addEventPicture(request, event_id)

							response.sendStatus(status.OK);
						}
					);

				}

			}, 
			function(err, count) {
				query.finalize();

				// If there is no user with that email.
				if (count == 0) {
					response.sendStatus(500);
				}
			}
		);

	} else {
		response.sendStatus(500);
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

	//var add = database.prepare("INSERT INTO Events (event_id, name, description, organiser, type, time, location, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);");
// add.run([event.id, event.name, event.description, event.organiser,
// event.type, event.time, event.location, event.popularity]);
	// add.finalize();
	
	console.log(event);
	
}

function addEventPicture(request, event_id){
	
	var files = request.files;
		
	var query = database.prepare("SELECT * FROM Event_Pictures WHERE event_id = ?");

	query.each(event_id, function(err, row) {
		// Count number of event images
	}, function(err, count) {
			
		query.finalize();
			
		var index = 0;
		
		for(var f in files){
			
			var file = files[f];	
			var filename = file.name;
			var ext = path.extname(filename).toLowerCase();
			var newFilename = 'e_' + event_id + "_" + (count + index) + ext;
			var relativePath = './public/uploaded/' + newFilename;

			if (ext === '.png' || ext === '.jpg') {

				// Move the file
				file.mv(relativePath, function(err) {
					if (err) {
						throw err;
					}
				});
				
				// var addPicture = database.prepare("INSERT INTO Event_Pictures(picture, event_id) VALUES (?, ?);");
				// addPicture.run([newFilename, event_id]);
				// addPicture.finalize();
				
				console.log('Uploaded: ' + filename + ' -> ' + newFilename);
			}	
			
			index += 1;
		}
	});
}

function get_profile(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session build the nav bar with the user options
	if (sessions.validSession(sessionToken)) {

		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query.each(email, function(err, row) {

			profile(request, response, row, "");

		}, function(err, count) {
			query.finalize();

			// If there is no user with that email.
			if (count == 0) {
				response.sendStatus(500);
			}
		});

	} else {
		response.sendStatus(500);
	}

}

/**
 * This method processes GET requests to the server for the landing page. The
 * request cookies may contain a session cookie whihc is used to determine which
 * client is which and also how long their session has been active for.
 */
function get_landing(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session build the nav bar with the user options
	if (sessions.validSession(sessionToken)) {

		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query.each(email, function(err, row) {

			home(request, response, row);

		}, function(err, count) {
			query.finalize();

			// If there is no user with that email show the landing
			// page.
			if (count == 0) {
				landing(request, response);
			}
		});

	} else {
		landing(request, response);
	}
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

		eventQuery.each(function(err, row) {

			var event = {
				"name" : row.name,
				"id" : row.event_id,
				"location" : row.location,
				"time" : row.time,
				"organiser" : row.email
			};

			events.push(event);

		}, function(err, count) {

			eventQuery.finalize();

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

/**
 * This method processes GET requests to the server for the login page.
 */
function get_login(request, response) {
	build_login(request, response, "");
}

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

/**
 * 
 */
function post_landing(request, response) {
	response.sendStatus(status.OK);
}

function post_login(request, response) {
	if (request.body.status === "login") {
		login(request, response);
	} else if (request.body.status === "signup") {
		signup(request, response);
	}
}

function post_profile(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session build the nav bar with the user options
	if (sessions.validSession(sessionToken)) {

		var email = sessions.getEmail(sessionToken);
		var query = database.prepare("SELECT * FROM Users WHERE email = ?");

		query
				.each(
						email,
						function(err, row) {

							var newPicture = changePicure(request, response,
									row);

							var password = row.password;

							if (request.body.password !== "") {
								password = MD5.hash(request.body.password
										+ row.salt);
							}

							var newRow = {
								"email" : row.email,
								"name" : (row.name !== request.body.name) ? request.body.name
										: row.name,
								"organiser" : request.body.organiser ? 'true'
										: 'false',
								"picture" : (newPicture !== row.picture) ? newPicture
										: row.picture,
								"password" : password,
								"telephone" : (row.telephone !== request.body.telephone) ? request.body.telephone
										: row.telephone
							};

							var update = database
									.prepare("UPDATE Users SET name = ?, organiser = ?, picture = ?, password = ?, telephone = ?  WHERE email = ?;");
							update.run([ newRow.name, newRow.organiser,
									newRow.picture, newRow.password,
									newRow.telephone, newRow.email ]);
							update.finalize();

							var info = builder.response("Changes Updated");

							profile(request, response, newRow, info);

						}, function(err, count) {
							query.finalize();
						});

	} else {
		response.sendStatus(500);
	}

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

	query
			.each(
					email,
					function(err, row) {

						var salted = MD5.hash(password + row.salt);

						if (salted === row.password) {

							var token = sessions.uniqueToken();

							// If the session is
							// added redirct the
							// client.
							if (sessions.addSession(token, email)) {
								response.cookie(cookieName, token, {
									maxAge : 999999
								});
								response.redirect('/CS2410/coursework');
							} else {
								// Session
								// alread
								// exists.
								var error = builder
										.error("Session exists elsewhere. Please sign out in the other location.");
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
							var error = builder.error("<strong>" + email
									+ "</strong> is not a valid email.");
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

	query
			.each(
					email,
					function(err, row) {
						// Do nothing
					},
					function(err, count) {
						query.finalize();

						// User does not exist already
						if (count == 0) {

							var insert = database
									.prepare("INSERT INTO Users('email', 'name', 'dob', 'organiser' ,'picture','password', 'salt', 'telephone') VALUES (?, ?, ?, ?, ?, ?, ?, ?);");
							insert.run([ email, name, dob, 'false', picture,
									saltedPassword, salt, telephone ]);
							insert.finalize();

							console.log("User created: [" + email + ", " + name
									+ ", " + dob + ", false, " + picture + ", "
									+ saltedPassword + ", " + salt + ", "
									+ telephone + "]");

							var token = sessions.uniqueToken();

							sessions.addSession(token, email);
							response.cookie(cookieName, token, {
								maxAge : 999999
							});
							response.redirect('/CS2410/coursework');

						} else {

							var error = builder
									.error("A user with Email: <strong>"
											+ email
											+ "</strong> already exists.");
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
