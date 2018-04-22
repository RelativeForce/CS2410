/**
 * This is a Module whihc contains a collection of functions that are used
 * across multiple end points.
 * 
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

// NPM Modules
const fs = require('fs');
const path = require('path');
const db = require('./dbHelper');

/**
 * This reads the specifed content file then preforms the specifed call back
 * function which should have one parameter which will be the contents of the
 * specifed file.
 * 
 * @param contentFile
 *            The file name of the .html file in the /components folder.
 * @param callback
 *            The function that will be performed after the file has been
 *            loaded.
 * @returns undefined
 */
function buildPage(contentFile, callback) {

	fs.readFile(path.join(__dirname, '../../components/' + contentFile + '.html'), function(err, content) {
		if (err) {
			throw err;
		}
		callback(content);
	});
}

/**
 * Sanitises HMTL to prevent XSS attacks.
 * 
 * @param html
 *            The html to be santised.
 * @returns The sanitised html
 */
function encodeHTML(html) {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

/**
 * Builds the response that will be sent to the client.
 * 
 * @param response
 *            The response that will be sent to the client.
 * @param text
 *            The response body.
 * @returns undefined
 */
function buildResponse(response, text) {

	response.writeHead(200, {
		'Content-Type' : 'text/html'
	});
	response.write(text);
	response.end();

}

/**
 * Sets the event images using the specifed request and deletes the old ones if
 * they have been changed.
 * 
 * @param request
 *            The request that was sent to the server that containes the files.
 * @param event_id
 *            The event id that the images are for.
 * @returns
 */
function changeEventPictures(request, event_id) {

	var files = request.files;

	// If the request has a specifed first picture swap it with the current one.
	if (request.body.pName0 && request.body.pName0 !== "") {
		swapPicture(event_id, files, encodeHTML(request.body.pName0), '0');
	}

	// If the request has a specifed second picture swap it with the current
	// one.
	if (request.body.pName1 && request.body.pName1 !== "") {
		swapPicture(event_id, files, encodeHTML(request.body.pName1), '1');
	}

	// If the request has a specifed third picture swap it with the current one.
	if (request.body.pName2 && request.body.pName2 !== "") {
		swapPicture(event_id, files, encodeHTML(request.body.pName2), '2');
	}

	// If the request has a specifed fourth picture swap it with the current
	// one.
	if (request.body.pName3 && request.body.pName3 !== "") {
		swapPicture(event_id, files, encodeHTML(request.body.pName3), '3');
	}

}

/**
 * Swaps the image that is currently assigned to the specifed picture number to
 * the new specific image.
 * 
 * @param event_id
 *            The event id that the picture is assigned to.
 * @param files
 *            The files that were sent with the request.
 * @param specificFile
 *            The file name of the new image.
 * @param pictureNum
 *            The number of the picture. Must be &gt;0 and &lt;4
 * @returns undefined.
 */
function swapPicture(event_id, files, specificFile, pictureNum) {

	var picture = 'none';

	// Iterate over all the pictures with the specifed event id
	db.each("SELECT * FROM Event_Pictures WHERE event_id = ?", [ event_id ], function(row) {

		/*
		 * If the current name is the name of the first image regardless of file
		 * extension.
		 */
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

/**
 * Deletes a specifed picture from the uploaded pictures if it exists.
 * 
 * @param picture
 *            The file name of the picture to be deleted.
 * @returns undefined.
 */
function deletePicture(picture) {

	// Delete the picture
	var toDelete = path.resolve('./public/uploaded/' + picture);
	if (fs.existsSync(toDelete)) {
		fs.unlinkSync(toDelete);
	}

	// Remove the picture from the database.
	db.run("DELETE FROM Event_Pictures WHERE picture = ?;", [ picture ]);

	console.log('Deleted: ' + picture);

}

/**
 * Inserst a new picture into the database.
 * 
 * @param event_id
 *            The id of the event that the picture is assigned to.
 * @param filename
 *            The old file name that the picture had.
 * @param newFilename
 *            The pictures new filename.
 * @returns undefined
 */
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