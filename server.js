const port = process.env.PORT || 3000;

// Imported modules
const express = require('express');
const app = express();
const server = app.listen(port, startServer);
const status = require('http-status');
const bodyParser = require('body-parser');
const path = require('path');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

// Routers
const root = require('./js/routers/root.js');
const login = require('./js/routers/login.js');
const profile = require('./js/routers/profile.js');
const event = require('./js/routers/event.js');
const organise = require('./js/routers/organise.js');
const logout = require('./js/routers/logout.js');
const search = require('./js/routers/search.js');
const events = require('./js/routers/myEvents.js');
const interest = require('./js/routers/interest.js');

// Modules
const db = require('./js/modules/dbHelper');

/**
 * Performs the operations necessary to start the server.
 * 
 * @returns undefined
 */
function startServer() {

	console.log('Listening on port ' + port);

	db.connect('./db/aston_events.sqlite3');

}

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use('/', root);
app.use('/login', login);
app.use('/profile', profile);
app.use('/event', event);
app.use('/organise', organise);
app.use('/logout', logout);
app.use('/search', search);
app.use('/events', events);
app.use('/interest', interest);
