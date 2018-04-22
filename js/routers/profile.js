/**
 * This is a Router which handles requests to the 'profile' end point. This end
 * point displays the profile for a user. If that user is signed in then that
 * user may edit the profile.
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
 * Handles GET requests to / and will respond with the profile page of the user
 * specifed by the request query.
 * 
 * @param request
 *            The GET request that was sent to the server.
 * @param response
 *            The response that will be sent to the clientt.
 * @returns undefined
 */
function get(request, response) {

	// If there is an email specifed
	if (request.query.email) {

		var email = request.query.email;

		db.each(
			"SELECT * FROM Users WHERE email = ?", 
			[ email ], 
			function(user) {

				// Check for the session cookie and wherther it is active.
				var sessionToken = request.cookies[cookieName];
	
				if (sessions.validSession(sessionToken)) {
					sessions.extend(sessionToken, response);
	
					var sessionUser = sessions.getDetails(sessionToken);
	
					var home = builder.navbarLink("/", "Home");
					var logout = builder.navbarLink("/logout", "Logout");
					var newEvent = builder.navbarLink("/organise", "Orgainse Event");
					var search = builder.navbarLink("/search", "Search Events");
					var myEvents = builder.navbarLink("/events", "My Events");
	
					var navbar = builder.navbar(
						(user.organiser === 'true') ? 
						[ home, newEvent, myEvents, search, logout ] : 
						[ home, search, logout ]
					);
	
					// If the current user owns the profile allow them to
					// edit it.
					viewProfile(response, user, sessionUser.email === email, navbar);
	
				} else {
	
					var login = builder.navbarLink("/login", "Login");
					var home = builder.navbarLink("/", "Home");
					var search = builder.navbarLink("/search", "Search Events");
	
					var navbar = builder.navbar([ home, login, search ]);
	
					viewProfile(response, user, false, navbar);
				}

			}, 
			function(count) {

				// If there is no user with that email redirect to the
				// landing page.
				if (count == 0) {
					response.redirect('/');
				}
			}
		);

	} else {
		// No valid session redirect the user to the home screen.
		response.redirect('/');
	}

}

/**
 * Handles a GET request to /edit and will respond with the edit profile page.
 * 
 * @param request
 *            The GET request that was sent to the server.
 * @param response
 *            The response that will be sent to the clientt.
 * @returns undefined
 */
function get_edit(request, response) {

	// If the email has been specifed.
	if (request.query.email) {

		var email = request.query.email;

		db.each(
			"SELECT * FROM Users WHERE email = ?", 
			[ email ], 
			function(user) {

				// Check for the session cookie and wherther it is
				// active.
				var sessionToken = request.cookies[cookieName];
	
				if (sessions.validSession(sessionToken)) {
					sessions.extend(sessionToken, response);
	
					var sessionUser = sessions.getDetails(sessionToken);
	
					if (sessionUser.email === email) {
	
						var home = builder.navbarLink("/", "Home");
						var logout = builder.navbarLink("/logout", "Logout");
						var newEvent = builder.navbarLink("/organise", "Orgainse Event");
						var search = builder.navbarLink("/search", "Search Events");
						var myEvents = builder.navbarLink("/events", "My Events");
	
						var navbar = builder.navbar((user.organiser === 'true') ? [ home, newEvent, myEvents, search,
								logout ] : [ home, search, logout ]);
	
						// If the current user owns the profile
						// allow them to edit it.
						editProfile(response, user, navbar);
	
					} else {
						response.redirect('/profile?email=' + email);
					}
	
				} else {
					response.redirect('/profile?email=' + email);
				}

			}, 
			function(count) {

				/*
				 * If there is no user with that email redirect to the landing page.
				 */
				if (count == 0) {
					response.redirect('/');
				}
			}
		);

	} else {
		// No valid session redirect the user to the home screen.
		response.redirect('/');
	}

}

/**
 * Handles POST requests to /edit which will updated the sessions user's details
 * with the details specifed in the request.
 * 
 * @param request
 *            The GET request that was sent to the server.
 * @param response
 *            The response that will be sent to the clientt.
 * @returns undefined
 */
function post_edit(request, response) {

	// The session token.
	var sessionToken = request.cookies[cookieName];

	// If there is a user signed in.
	if (sessions.validSession(sessionToken)) {

		// Extend the user
		sessions.extend(sessionToken, response);

		var user = sessions.getDetails(sessionToken);

		// Iterate over the user's details

		// Change the profile picture
		var newPicture = changePicure(request, user);

		// Updated the password if there is a new password
		// specified
		var password = user.password;
		if (request.body.password !== "") {
			password = MD5.hash(request.body.password + user.salt);
		}

		// The updated user details
		var newRow = {
			"email" : user.email,
			"name" : (user.name !== request.body.name) ? request.body.name : user.name,
			"organiser" : request.body.organiser ? 'true' : 'false',
			"picture" : (newPicture !== user.picture) ? newPicture : user.picture,
			"password" : password,
			"telephone" : (user.telephone !== request.body.telephone) ? request.body.telephone : user.telephone
		};

		// Update the user details in the database
		db.run(
			"UPDATE Users SET name = ?, organiser = ?, picture = ?, password = ?, telephone = ?  WHERE email = ?;", 
			[newRow.name, newRow.organiser, newRow.picture, newRow.password, newRow.telephone, newRow.email ]
		);

		console.log("Profile Update [" + user.email + "]");

		response.redirect('/profile?email=' + user.email);

	} else {
		// If the session was invalid
		response.redirect('/');
	}

}

/**
 * Builds the view profile page.
 * 
 * @param response
 *            The response that will be sent to the client.
 * @param user
 *            The user details for viewing profile.
 * @param canEdit
 *            whetehr the current user can edit this profile.
 * @param navbar
 *            The navbar that will be displayed at the top of the page.
 * @returns undefined
 */
function viewProfile(response, user, canEdit, navbar) {

	var profile = builder.viewProfile(user, canEdit);

	var head = builder.head("Profile");
	var body = builder.body(navbar, profile);
	var page = builder.page(head, body);

	misc.buildResponse(response, page);

}

/**
 * Builds the edit profile page/
 * 
 * @param response
 *            The response that will be sent to the client.
 * @param user
 *            The user details for viewing profile.
 * @param navbar
 *            The navbar that will be displayed at the top of the page.
 * @returns undefined
 */
function editProfile(response, user, navbar) {

	var profile = builder.editProfile(user);

	var head = builder.head("Profile");
	var body = builder.body(navbar, profile);
	var page = builder.page(head, body);

	misc.buildResponse(response, page);

}

/**
 * Swaps the picture that was been uploaded from the client with the current
 * user profile picture.
 * 
 * @param request
 *            The POST request that was sent to the server.
 * @param user
 *            The user details of the profile.
 * @returns The new file path of the profile picture.
 */
function changePicure(request, user) {

	// If no file was uploaded then there is no change.
	if (!request.files.picture) {
		return user.picture;
	}

	var pictureName = user.email.split("@")[0];
	var file = request.files.picture;
	var ext = path.extname(file.name).toLowerCase();
	var newFilename = 'pp_' + pictureName + ext;
	var relativePath = './public/uploaded/' + newFilename;

	if (ext === '.png' || ext === '.jpg') {

		// If there is a current picture attempt to delete it.
		if (user.picture !== 'none') {

			var toDelete = path.resolve('./public/uploaded/' + user.picture);

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

	return user.picture;

}

router.get('/', get);
router.get('/edit', get_edit);
router.post('/edit', post_edit);

module.exports = router;