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
const logout = require('./js/routers/logout.js');
const search = require('./js/routers/search.js');
const events = require('./js/routers/myEvents.js');


// My modules
const db = require('./js/modules/dbHelper');

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
app.use('/CS2410/coursework/logout', logout);
app.use('/CS2410/coursework/search', search);
app.use('/CS2410/coursework/events', events);


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
