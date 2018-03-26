// Import required packages
const express = require('express');
const status = require('http-status');
const path = require('path');
const fs = require('fs');
const port = 3000;
const app = express();
const builder = require('./js/pageBuilder');
const sqlite3 = require('sqlite3').verbose();

var database;

// Add /public as the static assets folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/CS2410/coursework/login', function(req, res) {

	// Builds the student login page
	buildPage('login', function(content){
		
		var home = builder.navbarLink("/CS2410/coursework", "Home");
		var navbar = builder.navbar([home]);
		var head = builder.head("Login");
		var body = builder.body(navbar, content);
		var page = builder.page(head, body);
		
		res.writeHead(200, {'Content-Type':'text/html'});
		res.write(page);
		res.end();
		
	});
	
});

app.get('/CS2410/coursework', function(req, res) {
	
	buildPage('landing', function(content){
		
		var login = builder.navbarLink("/CS2410/coursework/login", "Login");
		var navbar = builder.navbar([login]);
		var head = builder.head("Aston Events");
		var body = builder.body(navbar, content);
		var page = builder.page(head, body);
		
		res.writeHead(200, {'Content-Type':'text/html'});
		res.write(page);
		res.end();
		
	});

});

app.post('/CS2410/coursework', function(req, res) {
	res.sendStatus(status.OK);
});

const server = app.listen(port, function() {
	console.log('Listening on port ' + port);
	
	// Connect to the database.
	database = new sqlite3.Database('./db/aston_events.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (err) {
	    if (err) console.log(err.message);
	});
	
	
	
	var insert = "INSERT INTO Users('user_id', 'name', 'dob', 'picture','password','email','telephone')";
	insert += " VALUES (0,'Terry','11/05/2018', 'oomoo.png', '#nothashedyet', 'death@aids.com', '12348997577');";
	
	// database.run(insert);
		
	
	
	
});

/*
 * This reads the specifed content file then preforms the specifed call back
 * function which should have one parameter which will be the contents of the
 * specifed file.
 */
function buildPage(contentFile, callback){
	
	fs.readFile(path.join(__dirname, 'components/' + contentFile + '.html'), function(err, content){
	    if (err) {
	       throw err;
	    }
	    callback(content);
	});
}