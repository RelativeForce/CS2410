/**
 * Holds all the valid sessions for this server.
 */
var sessions = [];

/**
 * Adds a new session to the server.
 * 
 * @param token
 *            The token to be added. This should be unique.
 * @param userEmail
 *            The email of the user that the session will be created for.
 * @returns Whether or not the session was added.
 */
function addSession(token, userEmail) {

	// Check if the user is already logged in.
	var userLoggedIn = contains(function(session) {
		return session["email"] === userEmail;
	});

	// If the user is already logged in the do not add the session.
	if (userLoggedIn) {
		console.log("Session exists.");

		return false;
	}

	// Sessions should last for 2 hours.
	var dateTime = new Date();
	dateTime.setHours(dateTime.getHours() + 2);

	// Constuct the new session
	var session = {
		"token" : token,
		"email" : userEmail,
		"maxAge" : dateTime
	};

	// Add the new session to the list.
	sessions.push(session);

	console.log("New Session: " + token);

	return true;
}

/**
 * Checks whether the sessions conatin that satisfy the parameter check.
 * 
 * @param check
 *            A function that takes a session as a parameter and returns boolean
 *            whether that session staifies it or not. For example the chcek
 *            could return whether the token is a specifed value or not.
 * @returns boolean
 */
function contains(check) {

	var numberOfSessions = sessions.length;

	// Iterate over all the sessions.
	for (var index = 0; index < numberOfSessions; index++) {

		// The current session
		var session = sessions[index];

		// The current date time
		var now = Date.now();

		// If the session has expired remove it.
		if (session["maxAge"] < now) {

			sessions.splice(index, 1);
			index--;
			numberOfSessions--;

		} else {

			// Preform the check on the current session.
			if (check(session)) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Checks if the specifed token maps to a valid current session.
 * 
 * @param token
 *            The token to be checked.
 * @returns Whether or not the specied token is a valid token.
 */
function validSession(token) {
	return contains(function(session) {
		return session["token"] === token;
	});
}

/**
 * Attempts to end the session with the specifed token.
 * 
 * @param token
 *            The token of the session to be ended.
 * @returns Whether or not the session with the token was ended or not.
 */
function endSession(token) {

	var removed = false;

	// Iterate over all the sessions.
	for (var index = 0; index < sessions.length && !removed; index++) {

		var session = sessions[index];

		// If the session has the token
		if (session["token"] === token) {

			// Remove the session
			sessions.splice(index, 1);
			removed = true;
			console.log("End Session: " + token);
		}

	}

}

/**
 * Generates a unique token that is not used by any of the current sessions.
 * 
 * @returns A unique token.
 */
function uniqueToken() {

	// Whether the most recently generated token is unique.
	var isUnique = false;
	var token = null;

	// Iterate while the most recently generated token is not unique.
	while (!isUnique) {

		token = generateToken();

		// Check if the token is already in use by another session.
		isUnique = !contains(function(session) {
			return session["token"] === token;
		});

	}

	return token;

}

/**
 * Generates a random alphanumeric string of a fixed length.
 * 
 * @returns A random alphanumeric string
 */
function generateToken() {

	// The length of the token.
	const tokenLength = 30;

	var token = "";

	// All the possible values of a character
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	// Iterate for the specifed number of characters in the final token.
	for (var index = 0; index < tokenLength; index++) {

		// Get a character at a random possition in the possible string and add
		// it to the token.
		token += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return token;
}

/**
 * Retreives the email that is assigned to the session with the specified token.
 * 
 * @param token
 *            The token assigned to a currently valid session.
 * @returns The email that is assigned to the session with the specified token
 *          if there is no session with that token then return null.
 */
function getEmail(token) {

	// Iterate over all the sessions.
	for (var index = 0; index < sessions.length; index++) {

		// The current session
		var session = sessions[index];

		// Check if the current session has the specifed token.
		if (session.token === token) {
			return session.email;
		}

	}

	return null;

}

module.exports = {
	uniqueToken : function() {
		return uniqueToken();
	},
	contains : function(check) {
		return contains(check);
	},
	addSession : function(token, userEmail) {
		return addSession(token, userEmail);
	},
	endSession : function(token) {
		return endSession(token);
	},
	getEmail : function(token) {
		return getEmail(token);
	},
	validSession : function(token) {
		return validSession(token);
	}
};