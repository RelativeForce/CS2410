/**
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

/**
 * Validates the event form fileds before thy can submit.
 * @returns undefined
 */
function validateEvent() {

	var name = document.getElementById("name").value;
	var description = document.getElementById("description").value;
	var time = document.getElementById("time").value;
	var location = document.getElementById("location").value;
	var date = document.getElementById("date").value;

	// If the user a has not inputted an event name.
	if (name == "") {
		alert("Name must be filled out");
		return false;
	}

	// If the user a has not inputted an event description.
	if (description == "") {
		alert("Description must be filled out");
		return false;
	}

	// If the user a has not inputted an event time.
	if (time == "") {
		alert("Time must be filled out");
		return false;
	}

	// If the user a has not inputted an event date.
	if (date == "") {
		alert("Date must be filled out");
		return false;
	}

	// If the user a has not inputted an event location.
	if (location == "") {
		alert("Location must be filled out");
		return false;
	}

	return true;

}

var numberOfPictures = document.getElementById("imageContainer").childElementCount - 1;

/**
 * Adds a picture input field to the current form.
 * 
 * @returns undefined
 * 
 */
function addPictureInput() {

	numberOfPictures++;

	var imageInput = document.createElement('div');
	imageInput.setAttribute("class", "imageInput col-sm-3");

	var input = document.createElement('input');
	input.setAttribute("class", "picture form-control");
	input.setAttribute("type", "file");
	input.setAttribute("name", "picture" + numberOfPictures);
	input.setAttribute("id", "picture" + numberOfPictures);
	input.onchange = function() {
		readURL(input);
	};

	var img = document.createElement('img');
	img.setAttribute("src", "No Picture");
	img.setAttribute("style", "width: 100%; height: 100%");
	img.setAttribute("alt", "event picture");
	img.setAttribute("id", "preview" + numberOfPictures);

	var text = document.createElement('input');
	text.style.visibility = "hidden";
	text.setAttribute("type", "text");
	text.setAttribute("name", "pName" + numberOfPictures);
	text.setAttribute("id", "pName" + numberOfPictures);

	imageInput.appendChild(input);
	imageInput.appendChild(img);
	imageInput.appendChild(text);

	document.getElementById("imageContainer").appendChild(imageInput);

	if (numberOfPictures == 3) {
		document.getElementById("imageContainerHeader").removeChild(
				document.getElementById("addPicture"));
	}

}