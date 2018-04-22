/**
 * This is a Router which handles requests to the 'login' end point. This end
 * point logs a user in and signs users up to the site.
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
const cookieName = sessions.cookieName;
const MD5 = require('./../modules/MD5');
const misc = require('./../modules/misc');

/**
 * Processes the GET requests to / and will respond with the login page.
 * 
 * @param request
 *            The GET request to the server.
 * @param response
 *            The response that will be sent to the client.
 * @returns undefined
 */
function get(request, response) {
	build_login(response, "");
}

/**
 * Processes POST requests to / and will log a client in or sign a client up. If
 * the request is valid the client will be redirected to the home page.
 * 
 * @param request
 *            The POST request that was sent to the server.
 * @param response
 *            The response that will be sent to the client.
 * @returns undefined
 */
function post(request, response) {

	// If the request is to log in.
	if (request.body.status === "login") {
		login(request, response);
	}

	// If the request is to sign up
	else if (request.body.status === "signup") {
		signup(request, response);
	}

	// Invalid request.
	else {
		response.redirect('/');
	}
}

/**
 * Handles a POST request to / that specifed that the user wants to login.
 * 
 * @param request
 *            The POST request that was sent to the server.
 * @param response
 *            The response that will be sent to the client.
 * @returns undefined
 */
function login(request, response) {

	// If the emaila nd password are populated
	if (request.body.email && request.body.password) {

		var email = misc.encodeHTML(request.body.email);
		var password = misc.encodeHTML(request.body.password);

		/*
		 * Iterate over all the users with the specifed email. There should only
		 * be one as the user email is unique.
		 */
		db.each("SELECT * FROM Users WHERE email = ?", [ email ], function(user) {

			var salted = MD5.hash(password + user.salt);

			// If the password created from the request fields is the same as
			// the password stored in the database.
			if (salted === user.password) {

				var token = sessions.uniqueToken();

				// If the session is added redirct the client.
				if (sessions.addSession(token, user)) {
					response.redirect('/');
				}
				// Session already exists.
				else {

					var error = builder.error("Session exists elsewhere. Please sign out in the other location.");
					build_login(response, error);
				}
			} else {

				// Invalid password
				var error = builder.error("Password is incorrect.");
				build_login(response, error);
			}

		}, function(count) {

			// Invalid email
			if (count == 0) {
				var error = builder.error("<strong>" + email + "</strong> is not a valid email.");
				build_login(response, error);
			}
		});
	} else {

		// Email or passowrd missing.
		var error = builder.error("<strong>email</strong> and/or <strong>password</strong> is not a defined.");
		build_login(response, error);
	}

}

/**
 * 
 * Handles a POST request to / that specifed that the user wants to signup.
 * 
 * @param request
 *            The POST request that was sent to the server.
 * @param response
 *            The response that will be sent to the client.
 * @returns undefined
 */
function signup(request, response) {

	// if all the signup feilds are populated.
	if (request.body.email && request.body.name && request.body.dob && request.body.telephone && request.body.password) {

		var salt = generateSalt();
		var password = misc.encodeHTML(request.body.password);
		var saltedPassword = MD5.hash(password + salt);

		var newUser = {

			"email" : misc.encodeHTML(request.body.email),
			"name" : misc.encodeHTML(request.body.name),
			"dob" : misc.encodeHTML(request.body.dob),
			"organiser" : "false",
			"picture" : "none",
			"password" : saltedPassword,
			"salt" : salt,
			"telephone" : misc.encodeHTML(request.body.telephone)

		};

		// Check that the email doesn not exist.
		db.each(
			"SELECT * FROM Users WHERE email = ?", 
			[ newUser.email ], 
			function(user) {
				// Count users
			}, function(count) {

				// User does not exist already
				if (count == 0) {

					db.run(
						"INSERT INTO Users('email', 'name', 'dob', 'organiser' ,'picture','password', 'salt', 'telephone') VALUES (?, ?, ?, ?, ?, ?, ?, ?);", 
						[newUser.email, newUser.name, newUser.dob, newUser.organiser, newUser.picture, newUser.password, newUser.salt, newUser.telephone ]
					);

					console.log("User created: " + newUser);

					var token = sessions.uniqueToken();

					sessions.addSession(token, newUser);
					response.redirect('/');

				} else {

					var error = builder.error("A user with Email: <strong>" + newUser.email + "</strong> already exists.");
					build_login(response, error);

				}
			}
		);

	} else {

		var error = builder.error("<strong>email</strong> and/or " + "<strong>password</strong> and/or "
				+ "<strong>name</strong> and/or " + "<strong>dob</strong> and/or "
				+ "<strong>telephone</strong> is not a defined.");
		build_login(response, error);

	}
}

/**
 * Builds the login page.
 * 
 * @param response
 *            The response that will be sent to the client.
 * @param error
 *            An error box that will be added to the top of the form.
 * @returns undefined
 */
function build_login(response, error) {

	// Builds the login page
	misc.buildPage('login', function(content) {

		var home = builder.navbarLink("/", "Home");
		var search = builder.navbarLink("/search", "Search Events");

		var navbar = builder.navbar([ home, search ]);
		var head = builder.head("Login");
		var body = builder.body(navbar, error + content);
		var page = builder.page(head, body);

		misc.buildResponse(response, page);

	});

}

/**
 * Generates a random alpha numeric string that will be used as the salt in the
 * database.
 * 
 * @returns A random alpha numeric string.
 */
function generateSalt() {

	const saltLength = 30;

	var salt = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < saltLength; i++) {
		salt += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return salt;
}

router.get('/', get);
router.post('/', post);

module.exports = router;