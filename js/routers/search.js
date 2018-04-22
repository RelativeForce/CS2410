/**
 * This is a Router which handles requests to the 'search' end point. This end
 * point displays the serch page.
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
const misc = require('./../modules/misc');
const cookieName = sessions.cookieName;

/**
 * Handles GET requests to / and will respond with a search event page that may
 * be filtered based on the request query.
 * 
 * @param request
 *            The GET request sent to the server.
 * @param response
 *            The response that will be sent to the client.
 * @returns undefined
 */
function get(request, response) {

	// Get the session token.
	var sessionToken = request.cookies[cookieName];

	// If the user is signed in
	if (sessions.validSession(sessionToken)) {

		// Extend the session
		sessions.extend(sessionToken, response);

		var user = sessions.getDetails(sessionToken);

		var logout = builder.navbarLink("/logout", "Logout");
		var profile = builder.navbarLink("/profile?email=" + user.email, "My Profile");
		var newEvent = builder.navbarLink("/organise", "Orgainse Event");
		var home = builder.navbarLink("/", "Home");
		var myEvents = builder.navbarLink("/events", "My Events");

		var navbar = builder.navbar(
			(user.organiser === 'true') ? 
			[ home, newEvent, myEvents, profile, logout ] : 
			[ home, profile, logout ]
		);

		filterEvents(request.query, response, navbar, user.email);

	} else {

		var login = builder.navbarLink("/login", "Login");
		var home = builder.navbarLink("/", "Home");

		var navbar = builder.navbar([ home, login ]);

		filterEvents(request.query, response, navbar, "");
	}

}

/**
 * Retreves the default search filter for the search page which is no filter and
 * ordered by date.
 * 
 * @returns Filter
 */
function getDefaultFilter() {

	return {

		"queryText" : "SELECT * FROM Events ORDER BY DATE(time) DESC",
		"params" : [],
		"filter" : {
			"by" : "date",
			"from" : "",
			"to" : ""
		}

	};

}

/**
 * Reteives the search that has been filtered by date.
 * 
 * @param query
 *            The query that from the request to the server.
 * @returns Filter
 */
function getDateFilter(query) {

	// The params for the date filter
	var from = query.from;
	var to = query.to;

	// The validity of the params
	var validFrom = (from) && (from !== "");
	var validTo = (to) && (to !== "");

	// If the user has specified a 'from' and 'to' dates
	if (validFrom && validTo) {

		return {

			"queryText" : "SELECT * FROM Events WHERE DATE(time) BETWEEN DATE(?) AND DATE(?) ORDER BY DATE(time) DESC;",
			"params" : [ from, to ],
			"filter" : {
				"by" : "date",
				"from" : from,
				"to" : to
			}

		};

	}
	// If the user has specifed just a 'from' date.
	else if (validFrom) {

		return {

			"queryText" : "SELECT * FROM Events WHERE DATE(time) >= DATE(?) ORDER BY DATE(time) DESC;",
			"params" : [ from ],
			"filter" : {
				"by" : "date",
				"from" : from,
				"to" : ""
			}

		};

	}
	// If the user has specifed just a 'to' date.
	else if (validTo) {

		return {

			"queryText" : "SELECT * FROM Events WHERE DATE(time) <= DATE(?) ORDER BY DATE(time) DESC;",
			"params" : [ to ],
			"filter" : {
				"by" : "date",
				"from" : "",
				"to" : to
			}

		};

	}
	// If the user has specifed no dates.
	else {
		return getDefaultFilter();
	}

}

/**
 * Reteives the search that has been filtered by event type.
 * 
 * @param query
 *            The query that from the request to the server.
 * @returns filter
 */
function getTypeFilter(query) {

	var type = query.type;

	var validType = (type) && (type !== "");

	// If there is a valid type specifed filter by that.
	if (validType) {

		return {

			"queryText" : "SELECT * FROM Events WHERE type = ? ORDER BY DATE(time) DESC;",
			"params" : [ type ],
			"filter" : {
				"by" : "type",
				"type" : type
			}

		};

	} else {
		return getDefaultFilter();
	}

}

/**
 * Reteives the search that has been filtered by popularity.
 * 
 * @param query
 *            The query that from the request to the server.
 * @returns Filter
 */
function getPopularityFilter(query) {

	var minimum = query.minimum;

	var validMinimum = (minimum) && (minimum !== "");

	// If the user has specifed a minimum popularity
	if (validMinimum) {

		return {

			"queryText" : "SELECT * FROM Events WHERE popularity >= ? ORDER BY popularity DESC;",
			"params" : [ minimum ],
			"filter" : {
				"by" : "popularity",
				"minimum" : minimum
			}

		};

	}
	// If the user ha not specifed a minumum popularity.
	else {

		return {

			"queryText" : "SELECT * FROM Events ORDER BY popularity DESC;",
			"params" : [],
			"filter" : {
				"by" : "popularity",
				"minimum" : ""
			}

		};
	}

}

/**
 * Filters the events based on the request query and the uses them to build the
 * serach page results.
 * 
 * @param query
 *            The query that from the request to the server.
 * @param response
 *            The response that will be sent to the user.
 * @param navbar
 *            The navbar that will be displayed at the top of the page.
 * @param email
 *            The email of the current user. If no user is signed in it will be
 *            blank.
 * @returns undefined
 */
function filterEvents(query, response, navbar, email) {

	var search = getFilter(query);

	db.collect(search.queryText, search.params, function(event) {

		event.hasLiked = false;
		return event;

	}, function(events) {

		// If there is a user signed in then check if they have liked any of the
		// events that will be displayed.
		if (email !== "") {

			db.each("SELECT * FROM Interest WHERE student_email = ?", [ email ], function(row) {

				/*
				 * Check if the current event is in the events list and if so
				 * then it has been liked by the user.
				 */
				for (var index = 0; index < events.length; index++) {
					var current = events[index];

					if (row.event_id === current.event_id) {
						current.hasLiked = true;
					}
				}

			}, function(interestCount) {
				build_search(response, events, navbar, search.filter, true)
			});

		} else {
			build_search(response, events, navbar, search.filter, false)
		}

	});

}

/**
 * Reterevs the filter that will be applied to the events in the search table
 * based on the specifed query.
 * 
 * @param query
 *            The query that from the request to the server.
 * @returns Filter
 */
function getFilter(query) {

	var search = getDefaultFilter();

	if (query.filter) {

		// The filter is by date
		if (query.filter === "Date") {
			search = getDateFilter(query);
		}
		// Filter by Type
		else if (query.filter === "Type") {
			search = getTypeFilter(query);
		}
		// Filter by Popularity
		else if (query.filter === "Popularity") {
			search = getPopularityFilter(query);
		}
	}

	return search;

}

/**
 * Builds the search page.
 * 
 * @param response
 *            The response that will be sent to the client.
 * @param events
 *            The array of events that will be displayed on the search page.
 * @param navbar
 *            The navbar that will appear at the top of the page.
 * @param filter
 *            The filter that resulted in the array of events.
 * @param signedIn
 *            Whether of not the user is signed in or not.
 * @returns undefined
 */
function build_search(response, events, navbar, filter, signedIn) {

	var eventsTable = builder.eventsTable(events, "Results", signedIn);
	var search = builder.search(filter);

	var head = builder.head("Search");
	var body = builder.body(navbar, search + eventsTable);
	var page = builder.page(head, body);

	misc.buildResponse(response, page);

}

router.get('/', get);

module.exports = router;