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
function post_edit(request, response) {

	// The session cookie.
	var sessionToken = request.cookies[cookieName];

	// Check for the session cookie and wherther it is active.
	if (sessions.validSession(sessionToken)) {

		sessions.extend(sessionToken, response);

		var email = sessions.getEmail(sessionToken);

		// Iterate over the user's details
		db
				.each(
						"SELECT * FROM Users WHERE email = ?",
						[ email ],
						function(row) {

							// Change the profile picture
							var newPicture = changePicure(request, response,
									row);

							// Updated the password if there is a new password
							// specified
							var password = row.password;
							if (request.body.password !== "") {
								password = MD5.hash(request.body.password
										+ row.salt);
							}

							// The updated user details
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

							// Update the user details in the database
							db
									.run(
											"UPDATE Users SET name = ?, organiser = ?, picture = ?, password = ?, telephone = ?  WHERE email = ?;",
											[ newRow.name, newRow.organiser,
													newRow.picture,
													newRow.password,
													newRow.telephone,
													newRow.email ]);

							console.log("Profile Update [" + email + "]");

							response
									.redirect('/profile?email='
											+ email);

						}, function(count) {

							// If the user email was invalid.
							if (count == 0) {
								response.redirect('/');
							}
						});

	} else {
		// If the session was invalid
		response.redirect('/');
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
function get(request, response) {

	if (request.query.email) {

		var email = request.query.email;

		db.each("SELECT * FROM Users WHERE email = ?", [ email ],
				function(row) {

					// Check for the session cookie and wherther it is active.
					var sessionToken = request.cookies[cookieName];

					if (sessions.validSession(sessionToken)) {
						sessions.extend(sessionToken, response);

						var sessionEmail = sessions.getEmail(sessionToken);

						var home = builder.navbarLink("/", "Home");
						var logout = builder.navbarLink(
								"/logout", "Logout");
						var newEvent = builder
								.navbarLink("/organise",
										"Orgainse Event");
						var search = builder.navbarLink(
								"/search", "Search Events");
						var myEvents = builder.navbarLink(
								"/events", "My Events");

						var navbar = builder
								.navbar((row.organiser === 'true') ? [ home,
										newEvent, myEvents, search, logout ]
										: [ home, search, logout ]);

						// If the current user owns the profile allow them to
						// edit it.
						viewProfile(request, response, row, "",
								sessionEmail === email, navbar);

					} else {

						var login = builder.navbarLink(
								"/login", "Login");
						var home = builder.navbarLink("/",
								"Home");
						var search = builder.navbarLink(
								"/search", "Search Events");

						var navbar = builder.navbar([ home, login, search ]);

						viewProfile(request, response, row, "", false, navbar);
					}

				}, function(count) {

					// If there is no user with that email redirect to the
					// landing page.
					if (count == 0) {
						response.redirect('/');
					}
				});

	} else {
		// No valid session redirect the user to the home screen.
		response.redirect('/');
	}

}

function get_edit(request, response) {

	if (request.query.email) {

		var email = request.query.email;

		db
				.each(
						"SELECT * FROM Users WHERE email = ?",
						[ email ],
						function(row) {

							// Check for the session cookie and wherther it is
							// active.
							var sessionToken = request.cookies[cookieName];

							if (sessions.validSession(sessionToken)) {
								sessions.extend(sessionToken, response);

								var sessionEmail = sessions
										.getEmail(sessionToken);

								if (sessionEmail === email) {

									var home = builder.navbarLink(
											"/", "Home");
									var logout = builder.navbarLink(
											"/logout",
											"Logout");
									var newEvent = builder.navbarLink(
											"/organise",
											"Orgainse Event");
									var search = builder.navbarLink(
											"/search",
											"Search Events");
									var myEvents = builder.navbarLink(
											"/events",
											"My Events");

									var navbar = builder
											.navbar((row.organiser === 'true') ? [
													home, newEvent, myEvents,
													search, logout ]
													: [ home, search, logout ]);

									// If the current user owns the profile
									// allow them to edit it.
									editProfile(request, response, row, "",
											navbar);

								} else {
									response
											.redirect('/profile?email='
													+ email);
								}

							} else {
								response
										.redirect('/profile?email='
												+ email);
							}

						}, function(count) {

							// If there is no user with that email redirect to
							// the landing page.
							if (count == 0) {
								response.redirect('/');
							}
						});

	} else {
		// No valid session redirect the user to the home screen.
		response.redirect('/');
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

function viewProfile(request, response, user, info, canEdit, navbar) {

	// Construct the organiser home page
	misc.buildPage('profile', function(content) {

		var profile = builder.viewProfile(user, canEdit);

		var head = builder.head("Profile");
		var body = builder.body(navbar, info + profile + content);
		var page = builder.page(head, body);

		misc.buildResponse(response, page);

	});

}

function editProfile(request, response, user, info, navbar) {

	// Construct the organiser home page
	misc.buildPage('profile', function(content) {

		var profile = builder.editProfile(user);

		var head = builder.head("Profile");
		var body = builder.body(navbar, info + profile + content);
		var page = builder.page(head, body);

		misc.buildResponse(response, page);

	});

}

router.get('/', get);
router.get('/edit', get_edit);
router.post('/edit', post_edit);

module.exports = router;