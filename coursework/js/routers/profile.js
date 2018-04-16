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
function post(request, response) {

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

function changeEventPictures(request, event_id){
	
	var files = request.files;
	
	if(request.body.pName0 && request.body.pName0 !== ""){
		swapPicture(event_id, files, misc.encodeHTML(request.body.pName0), '0');
	}

	if(request.body.pName1 && request.body.pName1 !== ""){
		swapPicture(event_id, files, misc.encodeHTML(request.body.pName1), '1');
	}

	if(request.body.pName2 && request.body.pName2 !== ""){
		swapPicture(event_id, files, misc.encodeHTML(request.body.pName2), '2');
	}

	if(request.body.pName3 && request.body.pName3 !== ""){
		swapPicture(event_id, files, misc.encodeHTML(request.body.pName3), '3');
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


function profile(request, response, user, info, canEdit, navbar) {

	// Construct the organiser home page
	misc.buildPage('profile', function(content) {

		var profile = builder.profile(user, canEdit);

		var head = builder.head("Profile");
		var body = builder.body(navbar, info + profile + content);
		var page = builder.page(head, body);

		misc.buildResponse(response, page);

	});

}


router.get('/', get);
router.post('/', post);

module.exports = router;