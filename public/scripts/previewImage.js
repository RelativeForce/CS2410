/**
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

/**
 * Updates the preview of an image based on the input that has specifed.
 * 
 * @param input
 *            The input that accepted the image file.
 * @returns undefined.
 */
function readURL(input) {

	// If there is a file to show
	if (input.files && input.files[0]) {

		var reader = new FileReader();
		var number = input.name.replace('picture', '');
		var filename = input.value.split(/(\\|\/)/g).pop();

		// Read the file
		reader.onload = function(e) {

			// Update the file selector
			var fileSelector = document.getElementById("pName" + number);
			if (fileSelector) {
				fileSelector.value = filename;
			}

			// Update the preview src
			var id = '#preview' + number;
			$(id).attr('src', e.target.result);
		}
		reader.readAsDataURL(input.files[0]);
	}
}