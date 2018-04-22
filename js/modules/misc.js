const fs = require('fs');
const path = require('path');
const db = require('./dbHelper');

/**
 * This reads the specifed content file then preforms the specifed call back
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

function changeEventPictures(request, event_id) {

	var files = request.files;

	if (request.body.pName0 && request.body.pName0 !== "") {
		swapPicture(event_id, files, encodeHTML(request.body.pName0), '0');
	}

	if (request.body.pName1 && request.body.pName1 !== "") {
		swapPicture(event_id, files, encodeHTML(request.body.pName1), '1');
	}

	if (request.body.pName2 && request.body.pName2 !== "") {
		swapPicture(event_id, files, encodeHTML(request.body.pName2), '2');
	}

	if (request.body.pName3 && request.body.pName3 !== "") {
		swapPicture(event_id, files, encodeHTML(request.body.pName3), '3');
	}

}

function swapPicture(event_id, files, specificFile, pictureNum) {

	var picture = 'none';

	// Iterate over all the pictures with the specifed event id
	db.each("SELECT * FROM Event_Pictures WHERE event_id = ?", [ event_id ], function(row) {

		// If the current name is the name of the first image
		// regardless of file
		// extension.
		if (row.picture.split('.')[0] === ('e_' + event_id + '_' + pictureNum)) {
			picture = row.picture;
		}
	}, function(count) {

		if (count != 0 && picture !== 'none') {
			deletePicture(picture);
		}

		// For all of the files the user wants to input
		for ( var f in files) {

			var file = files[f];
			var filename = file.name;

			// If the current file is the file for the current
			// slot.
			if (filename === specificFile) {

				var ext = path.extname(filename).toLowerCase();
				var newFilename = 'e_' + event_id + "_" + pictureNum + ext;
				var relativePath = './public/uploaded/' + newFilename;

				// If the image is the valid file type
				if (ext === '.png' || ext === '.jpg') {

					// Move the file
					file.mv(relativePath, function(err) {
						if (err) {
							throw err;
						}
					});

					// Insert the entry into the database
					insertPicture(event_id, filename, newFilename);

				}
			}
		}
	});

}

function deletePicture(picture) {

	var toDelete = path.resolve('./public/uploaded/' + picture);
	if (fs.existsSync(toDelete)) {
		fs.unlinkSync(toDelete);
	}

	db.run("DELETE FROM Event_Pictures WHERE picture = ?;", [ picture ]);

	console.log('Deleted: ' + picture);

}

function insertPicture(event_id, filename, newFilename) {

	db.run("INSERT INTO Event_Pictures(picture, event_id) VALUES (?, ?);", [ newFilename, event_id ]);

	console.log('Uploaded: ' + filename + ' -> ' + newFilename);

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
	},
	changeEventPictures : function(request, event_id) {
		return changeEventPictures(request, event_id);
	}

};