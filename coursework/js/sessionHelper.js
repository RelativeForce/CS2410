var sessions = [];

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

	var dateTime = new Date();
	dateTime.setHours(dateTime.getHours() + 2);

	var session = {
		"token" : token,
		"email" : userEmail,
		"maxAge" : dateTime
	};

	sessions.push(session);

	console.log("New Session: " + token);

	return true;
}

function contains(check) {

	for (var i = 0; i < sessions.length; i++) {

		var session = sessions[i];

		if (check(session)) {
			return true;
		}

	}

	return false;
}

function uniqueToken() {

	var isUnique = false;
	var token = null;

	while (!isUnique) {

		token = generateToken();

		isUnique = !contains(function(session) {
			return session["token"] === token;
		});

	}

	return token;

}

function generateToken() {

	const tokenLength = 30;

	var token = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < tokenLength; i++) {
		token += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return token;
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
	}
};