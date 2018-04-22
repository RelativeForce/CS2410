/**
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */


/**
 * Using AJAX sends a request to the server which will change the interest state
 * of a user to a specifed event based on the button that was clicked. The
 * button's id should be 'interestX' where X is the event id. The buttons inner
 * text should be ether 'Like' of 'Unlike'.
 * 
 * This method will change the apperance of the button that called it ad also
 * the popularity value stored in a tag with id 'popularityX' where X is the
 * event id if it exists.
 * 
 * @param button
 *            The button that triggered this event.
 * @returns undefined.
 */
function changeInterest(button) {

	var event_id = button.id.replace("interest", "");
	var currentValue = (button.innerText === "Like") ? "like" : "unlike";

	/*
	 * Send an AJAX call to the interest end point to change the interest state
	 * of the currently signed in user.
	 */
	$.ajax({
		url : "/interest",
		data : {
			"event_id" : event_id,
			"state" : currentValue
		},
		type : 'POST',
		success : function(response) {

			var popularity = document.getElementById("popularity" + event_id);

			// If the request was successful
			if (response === "success") {

				// If the button said 'like' before change it to now say 'Unlike'
				if (currentValue === "like") {
					button.innerText = "Unlike";
					button.classList.remove("btn-success");
					button.classList.add("btn-danger");
					
					// Increase the event popularity
					popularity.innerText = parseInt(popularity.innerText) + 1;

				} 
				// If the button said 'unlike' before change it to now say 'Like'
				else {
					button.innerText = "Like";
					button.classList.remove("btn-danger");
					button.classList.add("btn-success");

					// Decrease the event popularity
					popularity.innerText = parseInt(popularity.innerText) - 1;
				}

			} else {
				alert("Update failed - Sorry about that");
			}
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert("Update failed - Sorry about that");
		}
	});

}