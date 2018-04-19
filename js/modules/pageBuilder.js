const fs = require('fs');
const path = require('path');

/**
 * Creates the &lt;head&gt; tag that will be used by all the pages.
 * 
 * @param title
 *            The title of the page.
 * @returns The &lt;head&gt; tag string.
 */
function head(title) {

	var head = '';
	head += '<head>';
	head += '	<meta charset="utf-8" />';
	head += '	<title>' + title + '</title>';
	head += '	<link href="/default.css" rel="stylesheet" type="text/css" />';
	head += '	<script src="/MD5.js"></script>';
	head += '	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>';
	head += '	<link rel="stylesheet" href="/bootstrap-3-3-5.css" />';
	head += '	<script src="/bootstrap-3-3-5.js"></script>';
	head += '</head>';

	return head;

}

/**
 * Creates the navbar that will be displayed at the top of all the pages.
 * 
 * @param navElements
 *            A array of navbar elements generated using
 *            <code>navbarLink(link, label)</code>
 * @returns The navbar string.
 */
function navbar(navElements) {

	var nav = '';
	nav += '<nav class="navbar navbar-inverse navbar-static-top">';
	nav += '	<div class="container-fluid">';
	nav += '		<div class="navbar-header">';
	nav += '			<button type="button" class="navbar-toggle collapsed pull-right" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">';
	nav += '				<span class="sr-only">Toggle navigation</span>';
	nav += '				<span class="icon-bar"></span>';
	nav += '				<span class="icon-bar"></span>';
	nav += '				<span class="icon-bar"></span>';
	nav += '			</button>';
	nav += '			<img class="pull-left navbar-brand" src="/assets/aston-logo.png" style="padding-top: 10px; padding-bottom: 10px; height: 50px" />';
	nav += '		</div>';
	nav += '		<div id="navbar" class="navbar-collapse collapse">';
	nav += '			<ul class="nav navbar-nav">';

	for (i = 0; i < navElements.length; i++) {
		nav += navElements[i];
	}

	nav += '</ul></div></div></nav>';

	return nav;

}

/**
 * Creates a error message box that can be placed anywhere on a page.
 * 
 * @param message
 *            The error message to be displayed.
 * @returns The error message box string.
 */
function error(message) {

	var error = '';

	error += '<div class="alert alert-danger">';
	error += message;
	error += '</div>';

	return error;
}

/**
 * Creates a link that appears on the navbar.
 * 
 * @param link
 *            The 'href' attribute of the link.
 * @param label
 *            The text that appears on the navbar for that link.
 * @returns A navbar link.
 */
function navbarLink(link, label) {
	return '<li><a href="' + link + '">' + label + '</a></li>';
}

/**
 * Creates the &lt;body&gt; tag for every page.
 * 
 * @param navbar
 *            The navbar of the page.
 * @param content
 *            The content of the page that will appear below the navbar.
 * @returns The &lt;body&gt; tag string.
 */
function body(navbar, content) {

	var body = '';
	body += '<body>';
	body += navbar;
	body += content;
	body += '</body>';

	return body;

}

/**
 * Creates the page.
 * 
 * @param head
 *            The &lt;head&gt; tag of the page.
 * @param body
 *            The &lt;body&gt; tag of the page.
 * @returns The html page string.
 */
function page(head, body) {

	var document = '';

	document += '<!DOCTYPE html>';
	document += '<html lang="en">';

	document += head;
	document += body;

	document += '</html>';

	return document;
}

/**
 * Creates a table that displays the details of a array of events.
 * 
 * @param events
 *            An array of JSON of events with the form { "name", "id",
 *            "location", "time", "type", "organiser", "popularity", "hasLiked" }.
 * @param title
 *            The title of the panel conatining the table.
 * @param signedIn
 *            Whether or not the current user is signed in or not.
 * @returns A events table string.
 */
function eventsTable(events, title, signedIn) {

	var eventsList = '';

	eventsList += '<div class="container">';
	eventsList += '		<div class="panel panel-default">';
	eventsList += '			<div class="panel-heading">' + title + '</div>';
	eventsList += '			<div class="panel-body">';
	eventsList += '				<table class="table table-striped">';
	eventsList += '					<thead>';
	eventsList += '						<tr>';
	eventsList += '							<th>Name</th>';
	eventsList += '							<th>Type</th>';
	eventsList += '							<th>Location</th>';
	eventsList += '							<th>Time</th>';
	eventsList += '							<th>Organiser Email</th>';
	eventsList += '							<th>Popularity</th>';
	eventsList += '						</tr>';
	eventsList += '					</thead>';
	eventsList += '					<tbody>';
	eventsList += '						<form id="eventForm" name="events">';
	eventsList += '							<input hidden type="text" value="none" id="event_id" name="event_id"/>';
	eventsList += '							<input hidden type="text" value="none" id="type" name="type"/>';

	for (var i = 0; i < events.length; i++) {

		var event = events[i];

		eventsList += '<tr>';
		eventsList += '		<td>' + event.name + '</td>';
		eventsList += '		<td>' + event.type + '</td>';
		eventsList += '		<td>' + event.location + '</td>';
		eventsList += '		<td>' + event.time + '</td>';
		eventsList += '		<td><a href="/profile?email=' + event.organiser + '">' + event.organiser
				+ '</a></td>';
		eventsList += '		<td id="popularity' + event.id + '">' + event.popularity + '</td>';
		eventsList += '		<td>';

		eventsList += '			<div class="btn-group">';
		eventsList += '				<a href="/event?event_id=' + event.id
				+ '" class="btn btn-primary btn-sm" role="button">View</a>';

		if (signedIn === true) {
			if (event.hasLiked) {

				eventsList += '<button class="btn btn-danger btn-sm" id="interest' + event.id
						+ '" onclick="changeInterest(this);" type="button">Unlike</button>';
			} else {
				eventsList += '<button class="btn btn-success btn-sm" id="interest' + event.id
						+ '" onclick="changeInterest(this);" type="button">Like</button>';
			}
		}

		eventsList += '			</div>';
		eventsList += '		</td>';
		eventsList += '</tr>';

	}

	eventsList += '</form></tbody></table></div></div></div>';
	eventsList += '<script src="/scripts/changeInterest.js"></script>';

	return eventsList;
}

/**
 * Creates the HTML content for the edit event page using the details of the
 * event.
 * 
 * @param eventDetails
 *            The details of the event.
 * @returns The edit event HTML string.
 */
function editEvent(eventDetails) {

	var event = '';

	event += '<div id="eventContainer" class="container">';
	event += '	<div class="panel panel-default">';
	event += '		<div class="panel-heading">';
	event += '			<h2 id="title">Edit Event</h2>';
	event += '		</div>';
	event += '		<div class="panel-body">';
	event += '			<form id="event" enctype="multipart/form-data" name="event" action="/event/edit" onsubmit="return validateEvent()" method="post">';
	event += '				<input hidden type="text" name="event_id" id="event_id" value="' + eventDetails.event_id + '"/>';

	// Name
	event += '				<div class="form-group">';
	event += '					<label for="name">Name:</label>';
	event += '					<input type="text" name="name" id="name" class="form-control" value="' + eventDetails.name + '"/>';
	event += '				</div>';

	var checked = 'checked="checked"';

	// Type
	event += '				<div class="form-group">';
	event += '					<label for="type">Type:</label>';
	event += '					<div class="radio">';
	event += '						<label><input type="radio" value="sport" name="type" '
			+ (eventDetails.type === "sport" ? checked : '') + '/>Sport</label>';
	event += '					</div>';
	event += '					<div class="radio">';
	event += '						<label><input type="radio" value="culture" name="type" '
			+ (eventDetails.type === "culture" ? checked : '') + '/>Culture</label>';
	event += '					</div>';
	event += '					<div class="radio">';
	event += '						<label><input type="radio" value="other" name="type"  '
			+ (eventDetails.type === "other" ? checked : '') + '/>Other</label>';
	event += '					</div>';
	event += '				</div>';

	// Location
	event += '				<div class="form-group">';
	event += '					<label for="location">Location:</label> ';
	event += '					<input type="text" name="location" id="location" class="form-control" value="'
			+ eventDetails.location + '"/>';
	event += '				</div>';

	// Date and Time
	var time = eventDetails.time.split(" ")[1];
	var date = eventDetails.time.split(" ")[0];

	event += '				<div class="row">';
	event += '					<div class="col-sm-6">';
	event += '						<div class="form-group">';
	event += '						<label for="date">Date:</label>';
	event += '						<input type="date" name="date" id="date" class="form-control" value="' + date + '"/>';
	event += '					</div>';
	event += '					</div>';
	event += '					<div class="col-sm-6">';
	event += '						<div class="form-group">';
	event += '							<label for="time">Time:</label>';
	event += '							<input type="time" name="time" id="time" class="form-control" value="' + time + '"/>';
	event += '						</div>';
	event += '					</div>';
	event += '				</div>';

	// Description
	event += '				<div class="form-group">';
	event += '					<label for="description">Description:</label>';
	event += '					<textarea class="form-control" id="description" rows="5" name="description">'
			+ eventDetails.description + '</textarea>';
	event += '				</div>';

	// Pictures
	event += '				<div class="col-sm-12">';
	event += '					<div id="pictureSection" class="form-group panel panel-default">';
	event += '						<div class="panel-heading" id="imageContainerHeader">';
	event += '							<label>Picture:</label>';

	// If there is 4 pictures dont show the 'add picture' button.
	if (eventDetails.pictures.length < 4) {
		event += '<button id="addPicture" class="btn btn-info" type="button" style="" onclick="addPictureInput()" value="+">+</button>';
	}

	event += '						</div>';
	event += '						<div id="imageContainer" class="panel-body">';

	// Iterate over all the event pictures
	for (var index = 0; index < eventDetails.pictures.length; index++) {

		var picture = eventDetails.pictures[index];

		event += '<div class="imageInput col-sm-3">';
		event += '		<input type="file" name="picture' + index + '" id="picture' + index
				+ '" class="form-control" onchange="readURL(this)" accept=".png,.jpg"/>';
		event += '		<img id="preview' + index + '" src="/uploaded/' + picture
				+ '" alt="event picture" style="width: 100%; height: 100%" />';
		event += '		<input hidden type="text" name="pName' + index + '" id="pName' + index + '" />';
		event += '</div>';
	}

	event += '						</div>';
	event += '					</div>';
	event += '				</div>';
	event += '				<button class="btn btn-primary" type="submit" form="event" value="Save Changes">Save Changes</button>';
	event += '			</form>';
	event += '		</div>';
	event += '	</div>';
	event += '</div>';

	return event;
}

/**
 * Creates the HTML content for the view event page using the details of the
 * event.
 * 
 * @param eventDetails
 *            The details of the event.
 * @param sessionType
 *            Whether there is no user signed in, a student signed in or the
 *            organiser of the event.
 * @returns The view event HTML string.
 */
function viewEvent(eventDetails, sessionType) {

	var event = '';

	event += '<div id="eventContainer" class="container">';
	event += '	<div class="panel panel-default">';
	event += '		<div class="panel-heading">';

	
	if (sessionType !== "") {

		event += '<div class="btn-toolbar pull-right">';
		event += '	<div class="btn-group">';
		
		if (sessionType === "organiser") {
			event += ' 		<a href="/event/edit?event_id=' + eventDetails.event_id
					+ '" class="btn btn-primary" role="button">Edit</a>';
		}

		if (eventDetails.hasLiked) {

			event += '<button class="btn btn-danger" id="interest' + eventDetails.event_id
					+ '" onclick="changeInterest(this);" type="button">Unlike</button>';
		} else {
			event += '<button class="btn btn-success" id="interest' + eventDetails.event_id
					+ '" onclick="changeInterest(this);" type="button">Like</button>';
		}
		
		
		event += '	</div>';
		event += '</div>';
		event += '<script src="/scripts/changeInterest.js"></script>';
		

	}

	

	event += '			<h2 id="title">Event: ' + eventDetails.name + '</h2>';
	event += '		</div>';
	event += '		<div class="panel-body">';

	// Type
	event += '			<div>';
	event += '				<label>Type:</label>';
	event += '				<p>' + eventDetails.type + '</p>';
	event += '			</div>';

	// Location
	event += '			<div>';
	event += '				<label>Location:</label> ';
	event += '				<p>' + eventDetails.location + '</p>';
	event += '			</div>';

	// Organiser
	event += '			<div>';
	event += '				<label>Organiser:</label> ';
	event += '				<p><a href="/profile?email=' + eventDetails.organiser + '">'
			+ eventDetails.organiser + '</a></p>';
	event += '			</div>';

	// Time
	event += '			<div>';
	event += '				<label>Time:</label> ';
	event += '				<p>' + eventDetails.time + '</p>';
	event += '			</div>';

	// Description
	event += '			<div>';
	event += '				<label>Description:</label>';
	event += '				<p>' + eventDetails.description + '</p>';
	event += '			</div>';

	// Popularity
	event += '			<div>';
	event += '				<label>Popularity:</label>';
	event += '				<p>' + eventDetails.popularity + '</p>';
	event += '			</div>';

	// Pictures
	event += '			<div>';
	event += '				<label>Pictures:</label>';
	event += '				<div class="col-sm-12">';
	event += '					<div id="pictureSection">';

	for (var index = 0; index < eventDetails.pictures.length; index++) {

		var picture = eventDetails.pictures[index];

		event += '<div class="imageInput col-sm-3">';
		event += '		<img id="preview' + index + '" src="/uploaded/' + picture
				+ '" alt="event picture" style="width: 100%; height: 100%" />';
		event += '</div>';
	}

	event += '					</div>';
	event += '				</div>';
	event += '			</div>';
	event += '		</div>';
	event += '	</div>';
	event += '</div>';

	return event;
}

/**
 * Creates the HTML content of the edit profile page using the details of the
 * profile.
 * 
 * @param userDetails
 *            The details of a user.
 * @returns The edit profile HTML string.
 */
function editProfile(userDetails) {

	var profile = '';

	profile += '<div class="container">';
	profile += '	<div class="panel panel-default">';
	profile += '		<div class="panel-heading">';
	profile += '			<h2 id="title">Profile: ' + userDetails.name + '</h2>';
	profile += '		</div>';
	profile += '		<div class="panel-body">';
	profile += '			<form id="information" enctype="multipart/form-data" name="information" action="/profile/edit" onsubmit="return validateProfile()" method="post">';
	profile += '				<div class="col-xs-12 col-sm-5">';
	profile += '					<div class="panel panel-default">';
	profile += '						<div class="panel-heading">';
	profile += '							Picture';
	profile += '						</div>';
	profile += '						<div class="panel-body">';
	profile += editPicture(userDetails.picture);
	profile += '						</div>';
	profile += '					</div>';
	profile += '				</div>';
	profile += '				<div class="col-xs-12 col-sm-7">';
	profile += '					<div class="panel panel-default">';
	profile += '						<div class="panel-heading">';
	profile += '							Information';
	profile += '						</div>';
	profile += '						<div class="panel-body">';
	profile += editProfileInformation(userDetails);
	profile += '						</div>';
	profile += '					</div>';
	profile += '				</div>';
	profile += '			</form>';
	profile += '		</div>';
	profile += '	</div>';
	profile += '</div>';

	return profile;
}

/**
 * Creates the HTML for a edit picture frame.
 * 
 * @param picturePath
 *            The file path of the picture that will be displayed in the frame.
 * @returns The edit picture HTML string.
 */
function editPicture(picturePath) {

	var picture = '';

	picture += '<input type="file" id="picture" name="picture" class="form-control" accept=".png,.jpg"/> ';

	// If the picture exists
	if (fs.existsSync(path.resolve('./public/uploaded/' + picturePath))) {
		picture += '<img id="preview" src="/uploaded/' + picturePath
				+ '" alt="profile picture" style="width: 100%; height: 100%"/>';
	} else {
		picture += '<img id="preview" src="No Picture" alt="profile picture" style="width: 100%; height: 100%"/>';
	}

	return picture;
}

/**
 * Creates the edit profile information HTML.
 * 
 * @param userDetails
 *            The user details that will populate the fields.
 * @returns The edit information HTML string.
 */
function editProfileInformation(userDetails) {

	var information = '';

	// Full name
	information += '	<div class="form-group">';
	information += '		<label for="name">Full Name:</label>';
	information += '		<input type="text"	name="name" id="name" class="form-control" value="' + userDetails.name
			+ '" />';
	information += '	</div>';

	// Password
	information += '	<div class="form-group">';
	information += '		<label for="password">Password:</label> ';
	information += '		<input type="password" name="password" id="password" class="form-control"/>';
	information += '	</div>';

	// Retry Password
	information += '	<div class="form-group">';
	information += '		<label for="repassword">Retype Password:</label> ';
	information += '		<input type="password" name="repassword" id="repassword" class="form-control"/>';
	information += '	</div>';

	// Telephone
	information += '	<div class="form-group">';
	information += '		<label for="telephone">Telephone:</label> ';
	information += '		<input type="text" name="telephone" id="telephone" class="form-control" value="'
			+ userDetails.telephone + '"/>';
	information += '	</div>';

	// Organiser
	information += '	<div class="form-check">';
	information += '		<input class="form-check-input" type="checkbox" name="organiser" id="organiser" '
			+ (userDetails.organiser === 'true' ? 'checked' : 'unchecked') + '/>';
	information += '		<label for="organiser">Event Organiser</label> ';
	information += '	</div>';

	// Save button
	information += '	<button class="btn btn-primary" type="submit" form="information" value="Save Changes">Save Changes</button>';

	return information;

}

/**
 * Creates the view profile HTML for a user.
 * 
 * @param userDetails
 *            The details of the user.
 * @param canEdit
 *            If the user can edit the profile.
 * @returns The view profile HTML.
 */
function viewProfile(userDetails, canEdit) {

	var profile = "";

	profile += '<div class="container">';
	profile += '	<div class="panel panel-default">';
	profile += '		<div class="panel-heading">';

	if (canEdit) {

		profile += '	<div class="btn-toolbar pull-right">';
		profile += ' 		<a href="/profile/edit?email=' + userDetails.email
				+ '" class="btn btn-primary" role="button">Edit</a>';
		profile += '	</div>';

	}

	profile += '			<h2 id="title">Profile: ' + userDetails.name + '</h2>';
	profile += '		</div>';
	profile += '		<div class="panel-body">';
	profile += '			<div class="col-xs-12 col-sm-5">';
	profile += '				<div class="panel panel-default">';
	profile += '					<div class="panel-heading">';
	profile += '						Picture';
	profile += '					</div>';
	profile += '					<div class="panel-body">';
	profile += viewPicture(userDetails.picture);
	profile += '					</div>';
	profile += '				</div>';
	profile += '			</div>';
	profile += '			<div class="col-xs-12 col-sm-7">';
	profile += '				<div class="panel panel-default">';
	profile += '					<div class="panel-heading">';
	profile += '						Information';
	profile += '					</div>';
	profile += '					<div class="panel-body">';
	profile += viewProfileInformation(userDetails);
	profile += '					</div>';
	profile += '				</div>';
	profile += '			</div>';
	profile += '		</div>';
	profile += '	</div>';
	profile += '</div>';

	return profile;

}

/**
 * Creates the view picture HTML.
 * 
 * @param picturePath
 *            The file name of the profile picture.
 * @returns The view picture HTML string.
 */
function viewPicture(picturePath) {

	var picture = '';

	// If the profile picture exists.
	if (fs.existsSync(path.resolve('./public/uploaded/' + picturePath))) {
		picture += '<img id="preview" src="/uploaded/' + picturePath
				+ '" alt="profile picture" style="width: 100%; height: 100%"/>';
	} else {
		picture += '<p>No picture</p>';
	}

	return picture;
}

/**
 * Creates the view profile information HTML for a user.
 * 
 * @param userDetails
 *            The user details that will be displayed.
 * @returns The view profile information HTML string.
 */
function viewProfileInformation(userDetails) {

	var information = '';

	information += '	<div>';
	information += '		<label>Email:</label>';
	information += '		<p>' + userDetails.email + '</p>';
	information += '	</div>';
	information += '	<div>';
	information += '		<label>Full Name:</label>';
	information += '		<p>' + userDetails.name + '</p>';
	information += '	</div>';
	information += '	<div>';
	information += '		<label>Date of birth:</label>';
	information += '		<p>' + userDetails.dob + '</p>';
	information += '	</div>';
	information += '	<div>';
	information += '		<label>Telephone:</label> ';
	information += '		<p>' + userDetails.telephone + '</p>';
	information += '	</div>';
	information += '	<div>';
	information += '		<label>Event Organiser</label> ';
	information += '		<p>' + (userDetails.organiser === 'true' ? 'Yes' : 'No') + '</p>';
	information += '	</div>';

	return information;

}

/**
 * Creates a response message box the will be displayed on the page to provide
 * feedback to the user.
 * 
 * @param message
 *            The message that will be displayed.
 * @returns The response message box HTML.
 */
function response(message) {

	var response = '';

	response += '<div class="alert alert-info">';
	response += message;
	response += '</div>';

	return response;

}

/**
 * Creates the search filter box.
 * 
 * @param filter
 *            The filter deatils that will be used to populated the filter
 *            fields.
 * @returns The search filter box HTML string.
 */
function search(filter) {

	var search = '';

	search += '	<div class="container">';
	search += '		<form method="GET" action="/search" onsubmit="return validateFilter()" id="search" name="search">';
	search += '			<div class="panel panel-default">';
	search += '				<div class="panel-heading">Filter Search</div>';
	search += '				<div class="panel-body">';
	search += '					<div class="row">';
	search += '						<div class="col-sm-6 pull-left">';
	search += '							<div class="form-group">';
	search += '								<label for="minimum">Filter:</label> ';
	search += '								<select onchange="changeFilter()" class="form-control" id="filter" name="filter">';
	search += '									<option ' + (filter.by === "date" ? 'selected="selected"' : '') + '>Date</option>';
	search += '									<option ' + (filter.by === "popularity" ? 'selected="selected"' : '') + '>Popularity</option>';
	search += '									<option ' + (filter.by === "type" ? 'selected="selected"' : '') + '>Type</option>';
	search += '								</select>';
	search += '							</div>';
	search += '						</div>';
	search += '						<div class="col=sm-6" id="value">';

	// Filter params
	if (filter.by === 'date') {

		search += '		<div class="col-sm-3">';
		search += '			<div class="form-group">';
		search += '				<label for="from">From:</label>';
		search += '				<input class="form-control" type="date" id="from" name="from" '
				+ ((filter.from !== "") ? ('value="' + filter.from + '"') : '') + '/>';
		search += '			</div>';
		search += '		</div>';
		search += '		<div class="col-sm-3 pull-right">';
		search += '			<div class="form-group">';
		search += '				<label for="to">To:</label>';
		search += '				<input class="form-control" type="date" id="to" name="to" '
				+ ((filter.to !== "") ? ('value="' + filter.to + '"') : '') + '/>';
		search += '			</div>';
		search += '		</div>';

	} else if (filter.by === 'popularity') {

		search += '	<div class="col-sm-6 pull-right">';
		search += '		<div class="form-group">';
		search += '			<label for="minimum">Minimum:</label> ';
		search += '			<input class="form-control" type="number" id="minimum" name="minimum" '
				+ ((filter.minimum !== "") ? ('value="' + filter.minimum + '"') : '') + '/>';
		search += '		</div>';
		search += '	</div>';

	} else if (filter.by === 'type') {

		search += '	<div class="col-sm-6 pull-left">';
		search += '		<div class="form-group">';
		search += '			<label for="minimum">Type:</label> ';
		search += '			<select class="form-control" id="type" name="type">';
		search += '				<option ' + (filter.type === "sport" ? 'selected="selected"' : '') + '>sport</option>';
		search += '				<option ' + (filter.type === "culture" ? 'selected="selected"' : '') + '>culture</option>';
		search += '				<option ' + (filter.type === "other" ? 'selected="selected"' : '') + '>other</option>';
		search += '			</select>';
		search += '		</div>';
		search += '	</div>';

	}

	search += '						</div>';
	search += '					</div>';
	search += '					<div class="row">';
	search += '						<div class="col-sm-12 pull-left">';
	search += '							<button class="form-control btn btn-primary" type="submit" form="search" value="Search">Search</button>';
	search += '						</div>';
	search += '					</div>';
	search += '				</div>';
	search += '			</div>';
	search += '		</form>';
	search += '	</div>';

	return search;

}

module.exports = {
	navbar : function(navElements) {
		return navbar(navElements);
	},
	head : function(title) {
		return head(title);
	},
	body : function(navbar, content) {
		return body(navbar, content);
	},
	page : function(head, body) {
		return page(head, body);
	},
	navbarLink : function(link, label) {
		return navbarLink(link, label);
	},
	error : function(message) {
		return error(message);
	},
	eventsTable : function(events, title, signedIn) {
		return eventsTable(events, title, signedIn);
	},
	editEvent : function(eventDetails) {
		return editEvent(eventDetails);
	},
	viewEvent : function(eventDetails, canEdit) {
		return viewEvent(eventDetails, canEdit);
	},
	viewProfile : function(userDetails, canEdit) {
		return viewProfile(userDetails, canEdit);
	},
	editProfile : function(userDetails) {
		return editProfile(userDetails);
	},
	response : function(message) {
		return response(message);
	},
	search : function(filter) {
		return search(filter);
	}
};