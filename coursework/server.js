const express = require('express');
const status = require('http-status');
const path = require('path')
const port = 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/CS2410/coursework/', function(req, res) {
	res.sendFile('C:/xampp/htdocs/CS2410/coursework/login.html');
});

app.post('/CS2410/coursework/', function(req, res) {
	res.sendStatus(status.OK);
});

app.listen(port, function() {
	console.log('Listening on port ' + port);
});