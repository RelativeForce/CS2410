function head(title) {

	var head = '';
	head += '<head>';
	head += '	<meta charset="utf-8" />';
	head += '	<title>' + title + '</title>';
	head += '	<link href="/default.css" rel="stylesheet" type="text/css" />';
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
	nav += '			<img class="pull-left navbar-brand" src="/aston-logo.png" style="padding-top: 10px; padding-bottom: 10px; height: 50px" />';
	nav += '		</div>';
	nav += '		<div id="navbar" class="navbar-collapse collapse">';
	nav += '			<ul class="nav navbar-nav">';

	for (i = 0; i < navElements.length; i++) {
		nav += navElements[i];
	}

	nav += '</ul></div></div></nav>';

	return nav;

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
	}

};