// Import required packages
const express = require('express');
const status = require('http-status');
const path = require('path');
const port = 3000;
const app = express();
const builder = require('./js/pageBuilder');

// Add /public as the static assets folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/CS2410/coursework/login-student', function(req, res) {
		
	var login = builder.login();
	var navbar = builder.navbar([login]);
	var head = builder.head("Student Login");
	var body = builder.body(navbar, "no content");
	var page = builder.page(head, body);
	
	res.writeHead(200, {'Content-Type':'text/html'});
	res.write(page);
	res.end();
	
});

app.get('/CS2410/coursework/login-organiser', function(req, res) {
	res.sendFile('C:/xampp/htdocs/CS2410/coursework/components/login-organiser.html');
});

app.get('/CS2410/coursework/', function(req, res) {
	res.sendFile('C:/xampp/htdocs/CS2410/coursework/components/landing.html');
});

app.post('/CS2410/coursework/', function(req, res) {
	res.sendStatus(status.OK);
});

app.listen(port, function() {
	console.log('Listening on port ' + port);
});