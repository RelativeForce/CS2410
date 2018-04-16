const fs = require('fs');
const path = require('path');

function head(title) {

	var head = '';
	head += '<head>';
	head += '	<meta charset="utf-8" />';
	head += '	<title>' + title + '</title>';
	head += '	<link href="/default.css" rel="stylesheet" type="text/css" />';
	head += '	<script src="/MD5.js"></script>';
	head += '	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>';
	head += '	<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" />';
	head += '	<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>';
	head += '</head>';

	return head;

}

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

function error(message) {

	var error = '';

	error += '<div class="alert alert-danger">';
	error += message;
	error += '</div>';

	return error;
}

function navbarLink(link, label) {
	return '<li><a href="' + link + '">' + label + '</a></li>';
}

function body(navbar, content) {

	var body = '';
	body += '<body>';
	body += navbar;
	body += content;
	body += '</body>';

	return body;

}

function page(head, body) {

	var document = '';

	document += '<!DOCTYPE html>';
	document += '<html lang="en">';

	document += head;
	document += body;

	document += '</html>';

	return document;
}

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
		eventsList += '		<td><a href="/CS2410/coursework/profile?email=' + event.organiser + '">' + event.organiser
				+ '</a></td>';
		eventsList += '		<td>' + event.popularity + '</td>';
		eventsList += '		<td>';

		if (signedIn === true) {
			if (event.hasLiked) {

				eventsList += '<input formaction="/CS2410/coursework" class="btn btn-danger btn-sm" id="interest'
						+ event.id + '" onclick="setEvent(' + event.id + ', this);" type="submit" value="Unlike"/>';
			} else {
				eventsList += '<input formaction="/CS2410/coursework" class="btn btn-success btn-sm" id="interest'
						+ event.id + '" onclick="setEvent(' + event.id + ', this);" type="submit" value="Like"/>';
			}
		}

		eventsList += '		<a href="/CS2410/coursework/event?event_id=' + event.id
				+ '"><button class="btn btn-primary btn-sm"  type="button" value="View">View</button></a>';

		eventsList += '		</td>';
		eventsList += '</tr>';

	}

	eventsList += '</form></tbody></table></div></div></div>';

	return eventsList;
}

function event(eventDetails, isOrganiser) {

	var eventHTML = '';

	if (isOrganiser) {
		eventHTML += editEvent(eventDetails);
	} else {
		eventHTML += viewEvent(eventDetails);
	}

	return eventHTML;
}

function editEvent(eventDetails) {

	var event = '';

	event += '<div class="container">';
	event += '	<div class="panel panel-default">';
	event += '		<div class="panel-heading">';
	event += '			<h2 id="title">Edit Event</h2>';
	event += '		</div>';
	event += '		<div class="panel-body">';
	event += '			<form id="event" enctype="multipart/form-data" name="event" action="/CS2410/coursework/event" onsubmit="return validateEvent()" method="post">';
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

	// Time
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

	event += '				<div class="col-sm-12">';
	event += '					<div id="pictureSection" class="form-group panel panel-default">';
	event += '						<div class="panel-heading" id="imageContainerHeader">';
	event += '							<label>Picture:</label>';

	if (eventDetails.pictures.length < 4) {
		event += '<button id="addPicture" class="btn btn-info" type="button" style="" onclick="addPictureInput()" value="+">+</button>';
	}

	event += '						</div>';
	event += '						<div id="imageContainer" class="panel-body">';

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

function viewEvent(eventDetails) {

	var event = '';

	event += '<div class="container">';
	event += '	<div class="panel panel-default">';
	event += '		<div class="panel-heading">';
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
	event += '				<p><a href="/CS2410/coursework/profile?email=' + eventDetails.organiser + '">'
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

function editProfile(userDetails) {

	var profile = '';

	profile += '<div class="container">';
	profile += '	<div class="panel panel-default">';
	profile += '		<div class="panel-heading">';
	profile += '			<h2 id="title">Profile: ' + userDetails.name + '</h2>';
	profile += '		</div>';
	profile += '		<div class="panel-body">';
	profile += '			<form id="information" enctype="multipart/form-data" name="information" action="/CS2410/coursework/profile" onsubmit="return validateProfile()" method="post">';
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

function editPicture(picturePath) {

	var picture = '';

	picture += '	<input type="file" id="picture" name="picture" class="form-control" accept=".png,.jpg"/> ';

	if (fs.existsSync(path.resolve('./public/uploaded/' + picturePath))) {
		picture += '	<img id="preview" src="/uploaded/' + picturePath
				+ '" alt="profile picture" style="width: 100%; height: 100%"/>';
	} else {
		picture += '	<img id="preview" src="No Picture" alt="profile picture" style="width: 100%; height: 100%"/>';
	}

	return picture;
}

function editProfileInformation(userDetails) {

	var information = '';

	information += '	<div class="form-group">';
	information += '		<label for="name">Full Name:</label>';
	information += '		<input type="text"	name="name" id="name" class="form-control" value="' + userDetails.name
			+ '" />';
	information += '	</div>';
	information += '	<div class="form-group">';
	information += '		<label for="password">Password:</label> ';
	information += '		<input type="password" name="password" id="password" class="form-control"/>';
	information += '	</div>';
	information += '	<div class="form-group">';
	information += '		<label for="repassword">Retype Password:</label> ';
	information += '		<input type="password" name="repassword" id="repassword" class="form-control"/>';
	information += '	</div>';
	information += '	<div class="form-group">';
	information += '		<label for="telephone">Telephone:</label> ';
	information += '		<input type="text" name="telephone" id="telephone" class="form-control" value="'
			+ userDetails.telephone + '"/>';
	information += '	</div>';
	information += '	<div class="form-check">';
	information += '		<input class="form-check-input" type="checkbox" name="organiser" id="organiser" '
			+ (userDetails.organiser === 'true' ? 'checked' : 'unchecked') + '/>';

	information += '		<label for="organiser">Event Organiser</label> ';
	information += '	</div>';
	information += '	<button class="btn btn-primary" type="submit" form="information" value="Save Changes">Save Changes</button>';

	return information;

}

function viewProfile(userDetails) {

	var profile = "";

	profile += '<div class="container">';
	profile += '	<div class="panel panel-default">';
	profile += '		<div class="panel-heading">';
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

function viewPicture(picturePath) {

	var picture = '';

	if (fs.existsSync(path.resolve('./public/uploaded/' + picturePath))) {
		picture += '<img id="preview" src="/uploaded/' + picturePath
				+ '" alt="profile picture" style="width: 100%; height: 100%"/>';
	} else {
		picture += '<p>No picture</p>';
	}

	return picture;
}

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

function response(message) {

	var response = '';

	response += '<div class="alert alert-info">';
	response += message;
	response += '</div>';

	return response;

}

function search(filter){
	
	var search = '';
	
	search += '	<div class="container">';
	search += '		<form method="GET" action="/CS2410/coursework/search" onsubmit="return validateFilter()" id="search" name="search">';
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
		search += '				<input class="form-control" type="date" id="from" name="from" ' + ((filter.from !== "") ? ('value="' + filter.from + '"') : '' ) + '/>';
		search += '			</div>';
		search += '		</div>';
		search += '		<div class="col-sm-3 pull-right">';
		search += '			<div class="form-group">';
		search += '				<label for="to">To:</label>';
		search += '				<input class="form-control" type="date" id="to" name="to" ' + ((filter.to !== "") ? ('value="' + filter.to + '"') : '' ) + '/>';
		search += '			</div>';
		search += '		</div>';

	} else if (filter.by === 'popularity') {
		
		search += '	<div class="col-sm-6 pull-right">';
		search += '		<div class="form-group">';
		search += '			<label for="minimum">Minimum:</label> ';
		search += '			<input class="form-control" type="number" id="minimum" name="minimum" ' + ((filter.minimum !== "") ? ('value="' + filter.minimum + '"') : '' ) + '/>';
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
	event : function(eventDetails, isOrganiser) {
		return event(eventDetails, isOrganiser);
	},
	profile : function(userDetails, canEdit) {

		if (canEdit == true) {
			return editProfile(userDetails);
		} else {
			return viewProfile(userDetails);
		}
	},
	response : function(message) {
		return response(message);
	},
	search : function(filter) {
		return search(filter);
	}
};