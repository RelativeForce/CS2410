const express = require('express');
const router = express.Router();

const db = require('./../modules/dbHelper');
const builder = require('./../modules/pageBuilder');
const sessions = require('./../modules/sessionHelper');
const cookieName = sessions.cookieName;
const MD5 = require('./../modules/MD5');
const misc = require('./../modules/misc');


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
function get(request, response) {
	build_login(request, response, "");
}

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
	else{
		response.redirect('/');
	}
}

function login(request, response) {

	// Sterilise the username and password
	var email = misc.encodeHTML(request.body.email);
	var password = misc.encodeHTML(request.body.password);

	db.each(
		"SELECT * FROM Users WHERE email = ?",
		[email], 
		function(user) {

			var salted = MD5.hash(password + user.salt);
	
			if (salted === user.password) {
	
				var token = sessions.uniqueToken();
	
				// If the session is added redirct the client.
				if (sessions.addSession(token, user)) {
					response.redirect('/');
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

function signup(request, response) {

	var salt = generateSalt();
	var password = misc.encodeHTML(request.body.password);
	var saltedPassword = MD5.hash(password + salt);
	
	var newUser = {
			
			"email" : misc.encodeHTML(request.body.email),
			"name" : misc.encodeHTML(request.body.name),
			"dob" : misc.encodeHTML(request.body.dob),
			"organiser" : "false",
			"picture"  : "none",
			"password"  : saltedPassword,
			"salt" : salt,
			"telephone" : misc.encodeHTML(request.body.telephone)
					
		};

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
					[newUser.email, newUser.name, newUser.dob, newUser.organiser, newUser.picture, newUser.password, newUser.salt, newUser.telephone]
				);
	
				console.log("User created: " + newUser);
	
				var token = sessions.uniqueToken();
	
				sessions.addSession(token, newUser);
				response.redirect('/');
	
			} else {
	
				var error = builder.error("A user with Email: <strong>" + newUser.email + "</strong> already exists.");
				build_login(request, response, error);
	
			}
		}
	);
}


function build_login(request, response, error) {

	// Builds the student login page
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