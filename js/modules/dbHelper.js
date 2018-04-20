const sqlite3 = require('sqlite3').verbose();

// Holds the connection to the SQLite database.
var database;

/**
 * Creates the 'Users' table.
 * 
 * @returns undefined
 */
function users() {

	var sql = 'CREATE TABLE Users (';
	sql += 'email TEXT PRIMARY KEY,';
	sql += 'name TEXT NOT NULL,';
	sql += 'dob TEXT NOT NULL,';
	sql += 'organiser TEXT NOT NULL,';
	sql += 'picture TEXT NOT NULL,';
	sql += 'password TEXT NOT NULL,';
	sql += 'salt TEXT NOT NULL,';
	sql += 'telephone TEXT NOT NULL';
	sql += ');';

	run(sql, []);

}

/**
 * Creates the 'Events' table.
 * 
 * @returns undefined
 */
function events() {

	var sql = 'CREATE TABLE Events (';
	sql += 'event_id INTEGER PRIMARY KEY,';
	sql += 'name TEXT NOT NULL,';
	sql += 'description TEXT NOT NULL,';
	sql += 'organiser TEXT NOT NULL,';
	sql += 'type TEXT NOT NULL,';
	sql += 'time TEXT NOT NULL,';
	sql += 'location TEXT NOT NULL,';
	sql += 'popularity INTEGER NOT NULL,';
	sql += 'FOREIGN KEY(organiser) REFERENCES Users(email)';
	sql += ');';

	run(sql, []);

}

/**
 * Creates the 'Interest' table.
 * 
 * @returns undefined
 */
function interest() {

	var sql = 'CREATE TABLE Interest (';
	sql += 'event_id INTEGER NOT NULL,';
	sql += 'student_email TEXT NOT NULL,';
	sql += 'FOREIGN KEY(event_id) REFERENCES Events(event_id)';
	sql += 'FOREIGN KEY(student_email) REFERENCES Users(email)';
	sql += ');';

	run(sql, []);

}

/**
 * Creates the 'Event_Pictures' table.
 * 
 * @returns undefined
 */
function pictures() {

	var sql = 'CREATE TABLE Event_Pictures (';
	sql += 'picture TEXT PRIMARY KEY,';
	sql += 'event_id INTEGER NOT NULL,';
	sql += 'FOREIGN KEY(event_id) REFERENCES Events(event_id)';
	sql += ');';

	run(sql, []);

}

/**
 * 
 * Performs an specified sanitised SQLite query on the database, then maps the
 * results using an anonymous function and stores those mappings in a collection
 * which is then passed to the onComplete function.
 * 
 * @param queryText
 *            An SQLite query on the Events table that will return a list of
 *            rows.
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
function collect(queryText, params, mapper, onComplete) {

	// Convert the query text into a sanitised SQLite query
	var query = database.prepare(queryText);

	// The collection of all the row mappings.
	var collection = [];

	query.each(params, function(err, row) {

		// If there was an error throw it.
		if (err) {
			throw err;
		}

		// The object that the row mapped to.
		var mapped = mapper(row);

		// Store the mapped value in the collection.
		collection.push(mapped);

	}, function(err, count) {

		query.finalize();

		if (err) {
			throw err;
		}

		// Perform the on complete function on the collection.
		onComplete(collection);

	});
}

/**
 * Performs a specified sanitised SQLite query on the database and performs a
 * anonymous function on each row and then another anonymous function
 * afterwards.
 * 
 * @param queryText
 *            An SQLite query on the Events table that will return a list of
 *            rows.
 * @param params
 *            An array of parameters for the SQLite query text which should be
 *            in the sanitised form.
 * @param action
 *            A function that takes the expected row from the query as a param
 *            that will be performed on each row result of the query.
 *            function(row)
 * @param onComplete
 *            A function that takes a integer representing the number of rows
 *            returned from the query as a param that will be called once all
 *            the rows have been iterated over. function(count)
 * @returns undefined
 */
function each(queryText, params, action, onComplete) {

	// Convert the query text into a sanitised SQLite query
	var query = database.prepare(queryText);

	query.each(params, function(err, row) {

		// If there was an error throw it.
		if (err) {
			throw err;
		}

		// Perform the action on the row/
		action(row);

	}, function(err, count) {
		query.finalize();

		if (err) {
			throw err;
		}

		// Perform the on complete function.
		onComplete(count);
	});

}

/**
 * Connects to the SQLite database file and if the file cannot be found then it
 * is created.
 * 
 * @param filename
 *            The file path of database file from this module.
 * @returns undefined
 */
function connect(filename) {

	// Connect to the database.
	database = new sqlite3.Database(filename, sqlite3.OPEN_READWRITE
			| sqlite3.OPEN_CREATE, function(err) {
		if (err) {
			console.log(err.message);
		}
	});

	// users(database);
	// events(database);
	// interest(database);
	// pictures(database);

	// run("DROP TABLE Events");

}

/**
 * 
 * @param queryText
 *            An SQLite query on the Events table that will not return any
 *            thing.
 * @param params
 *            An array of parameters for the SQLite query text which should be
 *            in the sanitised form.
 * @returns undefined
 */
function run(queryText, params) {
	var query = database.prepare(queryText);
	query.run(params);
	query.finalize();
}

module.exports = {
	connect : function(filename) {
		connect(filename);
	},
	collect : function(queryText, params, mapper, onComplete) {
		collect(queryText, params, mapper, onComplete);
	},
	each : function(queryText, params, action, onComplete) {
		each(queryText, params, action, onComplete);
	},
	run : function(queryText, params) {
		run(queryText, params);
	}
};