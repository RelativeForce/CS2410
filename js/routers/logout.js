/**
 * This is a Router which handles requests to the 'logout' end point. This end
 * point logs a user out.
 * 
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

// NPM Modules
const express = require('express');
const router = express.Router();

// My Modules
const sessions = require('./../modules/sessionHelper');
const cookieName = sessions.cookieName;

/**
 * Handles the GET and POST requests to / which will redirect to the landing
 * page and end the users session.
 * 
 * @param request
 *            The request from the client that may contain the session cookie.
 * @param response
 *            Redirect the client to the landing page.
 * @returns undefined
 */
function logout(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session end it.
	if (sessions.validSession(sessionToken)) {
		sessions.endSession(sessionToken);
	}

	response.clearCookie(cookieName);
	response.redirect('/');

}

router.get('/', logout);
router.post('/', logout);

module.exports = router;