const port = 80;

// Imported modules
const express = require('express');
const app = express();
const server = app.listen(port, startServer);
const status = require('http-status');
const bodyParser = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

// My Routers
const root = require('./js/routers/root.js');
const login = require('./js/routers/login.js');
const profile = require('./js/routers/profile.js');
const event = require('./js/routers/event.js');
const organise = require('./js/routers/organise.js');


// My modules
const db = require('./js/modules/dbHelper');
const builder = require('./js/modules/pageBuilder');
const sessions = require('./js/modules/sessionHelper');
const misc = require('./js/modules/misc');
const cookieName = sessions.cookieName;

// GET handlers ---------------------------------------------------------------

/**
 * Processes the GET requests to the 'logout' end point which will redirect to
 * the landing page and end the users session.
 * 
 * @param request
 *            The request from the client that may contain the session cookie.
 * @param response
 *            Redirect the client to the landing page.
 * @returns undefined
 */
function get_logout(request, response) {

	// Check for the session cookie and wherther it is active.
	var sessionToken = request.cookies[cookieName];

	// If there is a active session end it.
	if (sessions.validSession(sessionToken)) {
		sessions.endSession(sessionToken);
	}

	response.clearCookie(cookieName);
	response.redirect('/CS2410/coursework');

}

function get_events(request, response){
	
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
				var home = builder.navbarLink("/CS2410/coursework", "Home");
				var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
				var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
				var profile = builder.navbarLink("/CS2410/coursework/profile?email=" + email, "My Profile");
	
				var navbar = builder.navbar([ home, newEvent, search, profile, logout ]);
	
				db.collect(
					"SELECT * FROM Events WHERE organiser = ? ORDER BY date(time) DESC", 
					[email], 
					function(row){
					
						return {
							"name" : row.name,
							"id" : row.event_id,
							"type" : row.type,
							"location" : row.location,
							"time" : row.time,
							"organiser" : row.organiser,
							"popularity": row.popularity,
							"hasLiked" : false
						};
					}, 
					function(events){
	
						var eventsTable = builder.eventsTable(events, "My Events", false);
						
						var head = builder.head("Aston Events");
						var body = builder.body(navbar, eventsTable);
						var page = builder.page(head, body);

						misc.buildResponse(response, page);
					}
				);

			}, 
			function(count) {
			
				// If there is no user with that email show the landing page.
				if (count == 0) {
					response.redirect('/CS2410/coursework');
				}
			}
		);

	} else {
		response.redirect('/CS2410/coursework');
	}
	
	
}

function get_search(request, response){
	
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


// Misc functions -------------------------------------------------------------

function updateInterest(request, email){
	
	var event_id = request.body.event_id;
	var type = request.body.type;

	if(event_id && type){
		
		if(type === "like"){
			
			db.run(
				"INSERT INTO Interest(event_id, student_email) VALUES (?, ?);", 
				[event_id, email]
			);
			
			db.run(
				"UPDATE Events SET popularity = popularity + 1  WHERE event_id = ?;",
				[event_id]
			);

			console.log("Interest update: " + email + " liked event " + event_id);
			
		}else if(type === "unlike"){
			
			db.run(
				"DELETE FROM Interest WHERE event_id = ? AND student_email = ?;",
				[event_id, email]
			);
			
			db.run(
				"UPDATE Events SET popularity = popularity - 1  WHERE event_id = ?;", 
				[event_id]
			);
			
			console.log("Interest update: " + email + " unliked event " + event_id);
		}
	}
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

function startServer() {

	console.log('Listening on port ' + port);

	db.connect();

}


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use('/CS2410/coursework', root);
app.use('/CS2410/coursework/login', login);
app.use('/CS2410/coursework/profile', profile);
app.use('/CS2410/coursework/event', event);
app.use('/CS2410/coursework/organise', organise);


app.get('/CS2410/coursework/logout', get_logout);
app.get('/CS2410/coursework/events', get_events);
app.get('/CS2410/coursework/search', get_search);


app.post(
	'/CS2410/coursework/interest', 
	function(request, response){
	
		console.log(request.body.event_id + " " + request.body.state);
		
		response.writeHead(200, {
			'Content-Type' : 'text/html'
		});
		response.write("I like toast");
		response.end();
		
	}
);
