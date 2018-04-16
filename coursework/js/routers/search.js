const express = require('express');
const router = express.Router();

const db = require('./../modules/dbHelper');
const builder = require('./../modules/pageBuilder');
const sessions = require('./../modules/sessionHelper');
const misc = require('./../modules/misc');
const cookieName = sessions.cookieName;

function get(request, response){
	
	misc.buildPage(
		'search', 
		function(content) {
		
			// Check for the session cookie and wherther it is active.
			var sessionToken = request.cookies[cookieName];

			// If there is a active session build the nav bar with the user options
			if (sessions.validSession(sessionToken)) {
				sessions.extend(sessionToken, response);
			
				var email = sessions.getEmail(sessionToken);
	
				db.each(
					"SELECT * FROM Users WHERE email = ?",
					[email], 
					function(user) {

						var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
						var profile = builder.navbarLink("/CS2410/coursework/profile?email=" + user.email, "My Profile");
						var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
						var home = builder.navbarLink("/CS2410/coursework", "Home");
						var myEvents = builder.navbarLink("/CS2410/coursework/events", "My Events");

						var navbar = builder.navbar((user.organiser === 'true') ? 
							[ home, newEvent, myEvents, profile, logout ] : 
							[ home, profile, logout ]);
					
						search(request, response, navbar);
					
					}, 
					function(count) {
						// Do nothing
					}
				);

			} else {
			
				var login = builder.navbarLink("/CS2410/coursework/login", "Login");
				var home = builder.navbarLink("/CS2410/coursework", "Home");
				
				var navbar = builder.navbar(
					[ home, login ]
				);
			
				search(request, response, navbar);
			}
		}
	);
}

function search(request, response, navbar){
	
	// Defalut order by date decsending 
	var queryText =  "SELECT * FROM Events ORDER BY DATE(time) DESC";
	var params = [];
	var filter = {
		"by" : "date",
		"from" : "",
		"to" : ""
	};
	
	if(request.query.filter){
		
		// The filter is by date
		if(request.query.filter === "Date"){
			
			// The params for the date filter
			var from = request.query.from;
			var to = request.query.to;
			
			// The validity of the params
			var validFrom = (from) && (from !== "");
			var validTo = (to) && (to !== "");
			
			// If the user has specified a from and to
			if(validFrom && validTo){
				
				queryText =  "SELECT * FROM Events WHERE DATE(time) BETWEEN DATE(?) AND DATE(?) ORDER BY DATE(time) DESC;";
				params = [from, to];
				filter = {
					"by" : "date", 
					"from" : from,
					"to" : to
				};
				
			}else if(validFrom){
				
				queryText =  "SELECT * FROM Events WHERE DATE(time) >= DATE(?) ORDER BY DATE(time) DESC;";
				params = [from];
				filter = {
					"by" : "date", 
					"from" : from,
					"to" : ""
				};
				
			}else if(validTo){
				
				queryText =  "SELECT * FROM Events WHERE DATE(time) <= DATE(?) ORDER BY DATE(time) DESC;";
				params = [to];
				filter = {
					"by" : "date", 
					"from" : "",
					"to" : to
				};
				
			}else{
				// Use default filter
			}
		}
		// Filter by Type
		else if(request.query.filter === "Type"){
			
			var type = request.query.type;
			
			var validType = (type) && (type !== "");
			
			if(validType){
				
				queryText =  "SELECT * FROM Events WHERE type = ? ORDER BY DATE(time) DESC;";
				params = [type];
				filter = {
					"by" : "type", 
					"type" : type
				};
				
			}else{
				// Use default filter
			}
			
			
		}
		// Filter by Popularity
		else if(request.query.filter === "Popularity"){
			
			var minimum = request.query.minimum;
			
			var validMinimum = (minimum) && (minimum !== "");
			
			if(validMinimum){
				
				queryText =  "SELECT * FROM Events WHERE popularity >= ? ORDER BY popularity DESC;";
				params = [minimum];
				filter = {
					"by" : "popularity", 
					"minimum" : minimum
				};
				
			}else{
				
				queryText =  "SELECT * FROM Events ORDER BY popularity DESC;";
				params = [];
				filter = {
					"by" : "popularity", 
					"minimum" : ""
				};	
			}			
		}
	}
	
	
	db.collect(
		queryText,
		params, 
		function(rawEvent){
		
			return {
				"name" : rawEvent.name,
				"id" : rawEvent.event_id,
				"location" : rawEvent.location,
				"time" : rawEvent.time,
				"type" : rawEvent.type,
				"organiser" : rawEvent.organiser,
				"popularity": rawEvent.popularity,
				"hasLiked" : false
			};
		}, 
		function(events){
			
			misc.buildPage(
				'search', 
				function(content) {
						
					var eventsTable = builder.eventsTable(events, "Results", false);
					var search = builder.search(filter);

					var head = builder.head("Search");
					var body = builder.body(navbar, content + search + eventsTable);
					var page = builder.page(head, body);

					misc.buildResponse(response, page);
						
				}
			);		
		}
	);
		
}

router.get('/', get);

module.exports = router;