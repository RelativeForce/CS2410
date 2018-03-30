const fs = require('fs');

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

	return error
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

function eventsTable(events, title) {

	var eventsList = '';

	eventsList += '<div class="container">';
	eventsList += '		<div class="panel panel-default">';
	eventsList += '			<div class="panel-heading">' + title + '</div>';
	eventsList += '			<div class="panel-body">';
	eventsList += '				<table class="table table-striped">';
	eventsList += '					<thead>';
	eventsList += '						<tr>';
	eventsList += '							<th>Name</th>';
	eventsList += '							<th>Location</th>';
	eventsList += '							<th>Time</th>';
	eventsList += '							<th>Organiser Email</th>';
	eventsList += '						</tr>';
	eventsList += '					</thead>';
	eventsList += '					<tbody>';

	for (var i = 0; i < events.length; i++) {

		var event = events[i];

		eventsList += '<tr>';
		eventsList += '		<td>';
		eventsList += '			<a href="/CS2410/coursework/event?id=' + event.id
				+ '">' + event.name + '</a></td>';
		eventsList += '		<td>' + event.location + '</td>';
		eventsList += '		<td>' + event.time + '</td>';
		eventsList += '		<td>' + event.organiser + '</td>';
		eventsList += '</tr>';

	}

	eventsList += '</tbody></table></div></div></div>';

	return eventsList;
}

function profile(userDetails) {

	var profile = '';

	profile += '<div class="container">';
	profile += '	<div class="panel panel-default">';
	profile += '		<div class="panel-heading">';
	profile += '			<h2 id="title">Profile: ' + userDetails.name + '</h2>';
	profile += '		</div>';
	profile += '		<div class="panel-body">';
	profile += '			<form id="information" name="information" action="/CS2410/coursework/profile" onsubmit="return validateProfile()" method="post">';
	profile += '				<div class="col-xs-12 col-sm-5">';
	profile += '					<div class="panel panel-default">';
	profile += '						<div class="panel-heading">';
	profile += '							Picture';
	profile += '						</div>';
	profile += '						<div class="panel-body">';
	profile += picture(userDetails.picture);
	profile += '						</div>';
	profile += '					</div>';
	profile += '				</div>';
	profile += '				<div class="col-xs-12 col-sm-7">';
	profile += '					<div class="panel panel-default">';
	profile += '						<div class="panel-heading">';
	profile += '							Information';
	profile += '						</div>';
	profile += '						<div class="panel-body">';
	profile += profileInformation(userDetails);
	profile += '						</div>';
	profile += '					</div>';
	profile += '				</div>';
	profile += '			</form>';
	profile += '		</div>';
	profile += '	</div>';
	profile += '</div>';

	return profile;
}

function picture(picturePath) {

	var picture = '';

	picture += '	<input type="file" id="imgInput" class="form-control"/> ';

	if (fs.existsSync(picturePath)) {
		picture += '	<img id="preview" src="' + picturePath
				+ '" alt="profile picture" style="width: 100%; height: 100%"/>';
	} else {
		picture += '	<img id="preview" src="No Picture" alt="profile picture" style="width: 100%; height: 100%"/>';
	}

	return picture;
}

function profileInformation(userDetails) {

	var information = '';

	information += '	<div class="form-group">';
	information += '		<label for="name">Full Name:</label>';
	information += '		<input type="text"	name="name" id="name" class="form-control" value="'
			+ userDetails.name + '" />';
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
			+ (userDetails.organiser === 'true' ? 'checked' : 'unchecked')
			+ '/>';

	information += '		<label for="organiser">Event Organiser</label> ';
	information += '	</div>';
	information += '	<button class="btn btn-primary" type="submit" form="information" value="Save Changes">Save Changes</button>';

	return information;

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
	eventsTable : function(events, title) {
		return eventsTable(events, title);
	},
	profile : function(userDetails) {
		return profile(userDetails);
	}
};