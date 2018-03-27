const port = 3000;

// Import requestuired packages
const express = require('express');
const status = require('http-status');
const path = require('path');
const fs = require('fs');
const app = express();
const dbHelper = require('./js/dbHelper.js');
const builder = require('./js/pageBuilder');
const MD5 = require('./public/MD5');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const server = app.listen(port, startServer);

var database;

// Add /public as the static assets folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/CS2410/coursework/login', get_login);
app.get('/CS2410/coursework', get_landing);
app.post('/CS2410/coursework/login', post_login);
app.post('/CS2410/coursework', post_landing);

function get_landing(request, response){
	
	buildPage('landing', function(content){
	
		var navbar;
		
		if(request.body.email){
		
			var logout = builder.navbarLink("/CS2410/coursework/logout", "Logout");
			var newEvent = builder.navbarLink("/CS2410/coursework/organise", "Orgainse Event");
			var search = builder.navbarLink("/CS2410/coursework/search", "Search Events");
			var myEvents = builder.navbarLink("/CS2410/coursework/events", "My Events");
		
			navbar = builder.navbar([newEvent,myEvents,search,logout]);
		
		}else{
			var login = builder.navbarLink("/CS2410/coursework/login", "Login");
			navbar = builder.navbar([login]);
		}
	
		var head = builder.head("Aston Events");
		var body = builder.body(navbar, content);
		var page = builder.page(head, body);
		
		response.writeHead(200, {'Content-Type':'text/html'});
		response.write(page);
		response.end();
		
	});
	
	
}

function get_login(request, response){
	 build_login(request, response,"");
}

function post_landing(request, response){
	response.sendStatus(status.OK);
}

function post_login(request, response){	
	if(request.body.status === "login"){
		login(request, response);
	}else if(request.body.status === "signup"){
		signup(request, response);
	}
}

function startServer(){
	
console.log('Listening on port ' + port);
	
	// Connect to the database.
	database = new sqlite3.Database('./db/aston_events.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (err) {
	    if (err) console.log(err.message);
	});
	
	// dbHelper.users(database);
	
	// add();
	
}

function add(){
	
	var insert = database.prepare("INSERT INTO Users('email', 'name', 'dob', 'picture','password', 'salt', 'telephone') VALUES (?, ?, ?, ?, ?, ?, ?);");
	insert.run(['death@aids.com','Terry','11/05/2018', 'oomoo.png', 'password', 'saltySalt', '12348997577']);
	insert.finalize();
	
}

function login(request, response){
	
	// Sterilise the username and password
	var email = encodeHTML(request.body.email);
	var password = encodeHTML(request.body.password);
	
	var query = database.prepare("SELECT * FROM Users WHERE email = ?");
	
	query.each(email, function(err, row) {
			
		var salted = MD5.hash(password + row.salt);
		
		if(salted === row.password){
			
			console.log(row.name + " has logged in.");
			response.redirect('/CS2410/coursework?email='+row.email);
			
		}else{
			
			// Invalid
			var error = builder.error("Password is incorrect.");
			build_login(request, response, error);
		}

		
	},function(err, count) {
		  query.finalize();
		  
		  // Invalid email
		  if(count == 0){
			  
			  var error = builder.error("<strong>" + email + "</strong> is not a valid email.");
			  
			  build_login(request, response, error);
			  
		  }
	});
	
}

function build_login(request, response,error){
	
	// Builds the student login page
	buildPage('login', function(content){
			
		var home = builder.navbarLink("/CS2410/coursework", "Home");
		var navbar = builder.navbar([home]);
		var head = builder.head("Login");
		var body = builder.body(navbar, error + content);
		var page = builder.page(head, body);
			
		response.writeHead(200, {'Content-Type':'text/html'});
		response.write(page);
		response.end();
			
	});
	
}

function signup(request, response){
	
	
	
}

function encodeHTML(html) {
    return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

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