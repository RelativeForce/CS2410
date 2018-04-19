function changeInterest(button) {

	var event_id = button.id.replace("interest", "");
	var currentValue = (button.innerText === "Like") ? "like" : "unlike";

	// Send an AJAX call to the interest end point to change the interest state
	// of the currently signed in user.
	$.ajax({
		url : "/interest",
		data : {
			"event_id" : event_id,
			"state" : currentValue
		},
		type : 'POST',
		success : function(response) {

			var popularity = document.getElementById("popularity" + event_id);

			if (response === "success") {

				if (currentValue === "like") {
					button.innerText = "Unlike";
					button.classList.remove("btn-success");
					button.classList.add("btn-danger");

					popularity.innerText = parseInt(popularity.innerText) + 1;

				} else {
					button.innerText = "Like";
					button.classList.remove("btn-danger");
					button.classList.add("btn-success");

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