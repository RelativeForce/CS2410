const sqlite3 = require('sqlite3').verbose();

// Holds the connection to the SQLite database.
var database;

/**
 * Creates the 'Users' table.
 * 
 * @param database
 *            The database the table will be created in.
 * @returns undefined
 */
function users(database){
	
	var sql = 'CREATE TABLE Users (';
	sql +='email TEXT PRIMARY KEY,';
	sql +='name TEXT NOT NULL,';
	sql +='dob TEXT NOT NULL,';
	sql +='organiser TEXT NOT NULL,';
	sql +='picture TEXT NOT NULL,';
	sql +='password TEXT NOT NULL,';
	sql +='salt TEXT NOT NULL,';
	sql +='telephone TEXT NOT NULL';
	sql +=');';
	
	database.run(sql);
	
}

/**
 * Creates the 'Events' table.
 * 
 * @param database
 *            The database the table will be created in.
 * @returns undefined
 */
function events(database){
	
	var sql = 'CREATE TABLE Events (';
	sql +='event_id INTEGER PRIMARY KEY,';
	sql +='name TEXT NOT NULL,';
	sql +='description TEXT NOT NULL,';
	sql +='organiser TEXT NOT NULL,';
	sql +='type TEXT NOT NULL,';
	sql +='time TEXT NOT NULL,';
	sql +='location TEXT NOT NULL,';
	sql +='popularity INTEGER NOT NULL,';
	sql += 'FOREIGN KEY(organiser) REFERENCES Users(email)';
	sql +=');';
	
	database.run(sql);
	
}

/**
 * Creates the 'Interest' table.
 * 
 * @param database
 *            The database the table will be created in.
 * @returns undefined
 */
function interest(database){
	
	var sql = 'CREATE TABLE Interest (';
	sql +='event_id INTEGER NOT NULL,';
	sql +='student_email TEXT NOT NULL,';
	sql += 'FOREIGN KEY(event_id) REFERENCES Events(event_id)';
	sql += 'FOREIGN KEY(student_email) REFERENCES Users(email)';
	sql +=');';
	
	database.run(sql);
	
}

/**
 * Creates the 'Event_Pictures' table.
 * 
 * @param database
 *            The database the table will be created in.
 * @returns undefined
 */
function pictures(database){
	
	var sql = 'CREATE TABLE Event_Pictures (';
	sql += 'picture TEXT PRIMARY KEY,';
	sql += 'event_id INTEGER NOT NULL,';
	sql += 'FOREIGN KEY(event_id) REFERENCES Events(event_id)';
	sql +=');';
	
	database.run(sql);
	
}

/**
 * 
 * This function performs an specified sanitised SQLite query on the database,
 * then maps the results using an anonymous function and stores those mappings
 * in a collection which is then passed to the onComplete function.
 * 
 * @param queryText
 *            An SQLite query on the Events table that will return a list of
 *            events,
 * @param params
 *            An array of parameters for the SQLite query text which should be
 *            in the sanitised form.
 * @param mapper
 *            A function that takes a row of the results of the query as its
 *            only paramerter and returns a object that will added to the
 *            collection passed to the onComplete function.
 * @param onComplete
 *            The function that will be called once all the results from the
 *            query are read and their mappings are stored.
 * @returns undefined
 */
function collect(queryText, params, mapper, onComplete){
	
	// Convert the query text into a sanitised SQLite query
	var query = database.prepare(queryText);

	// The collection of all the row mappings.
	var collection = [];
	
	query.each(
		params, 
		function(err, row) {
		
			// If there was an error throw it.
			if(err){
				throw err;
			}
		
			// The object that the row mapped to.
			var mapped = mapper(row);
		
			// Store the mapped value in the collection.
			collection.push(mapped);
		
		},function(err, count){
		
			query.finalize();
		
			if(err){
				throw err;
			}
		
			// Perform the on complete function on the collection.
			onComplete(collection);
		
		}
	);
}

function each(queryText, params, action , onComplete){
	
	// Convert the query text into a sanitised SQLite query
	var query = database.prepare(queryText);
	
	query.each(
		params, 
		function(err, row) {
		
			// If there was an error throw it.
			if(err){
				throw err;
			}
		
			// Perform the action on the row/
			action(row);
		
		},
		function(err, count){
			query.finalize();
		
			if(err){
				throw err;
			}
		
			// Perform the on complete function.
			onComplete(count);
		
		}
	);
	
}

function connect(){
	
	// Connect to the database.
	database = new sqlite3.Database(
		'./db/aston_events.sqlite3',
		sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
		function(err) {
			if (err){
			console.log(err.message);
			}
		}
	);
	
	// dbHelper.users(database);
	// dbHelper.events(database);
	// dbHelper.interest(database);
	// dbHelper.pictures(database);

	// Emergancy command
	// database.run("DROP TABLE Events");
	
}

function run(queryText, params){
	var query = database.prepare(queryText);
	query.run(params);
	query.finalize();
}

module.exports = {
	connect : function(){
		connect();
	},	
	collect : function(queryText, params, mapper, onComplete) {
		collect(queryText, params, mapper, onComplete);
	},
	each : function(queryText, params, action , onComplete){
		each(queryText, params, action , onComplete);
	},
	run : function(queryText, params){
		run(queryText, params);
	},
	users : function(database){
		users(database);
	},
	events : function(database){
		events(database);
	},
	interest : function(database){
		interest(database);
	},
	pictures : function(database){
		pictures(database);
	}
};