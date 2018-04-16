const fs = require('fs');
const path = require('path');

/**
This reads the specifed content file then preforms the specifed call back
 * function which should have one parameter which will be the contents of the
 * specifed file.
 */
function buildPage(contentFile, callback) {

	fs.readFile(path.join(__dirname, '../../components/' + contentFile + '.html'), function(err, content) {
		if (err) {
			throw err;
		}
		callback(content);
	});
}

function encodeHTML(html) {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function buildResponse(response, text) {

	response.writeHead(200, {
		'Content-Type' : 'text/html'
	});
	response.write(text);
	response.end();

}

module.exports = {

	buildPage : function(contentFile, callback) {
		buildPage(contentFile, callback);
	},
	encodeHTML : function(html) {
		return encodeHTML(html);
	},
	buildResponse : function(response, page) {
		buildResponse(response, page);
	}

};