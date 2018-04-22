/**
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

/**
 * Checks that all the fields of the edit profile fomr are populated and valid.
 * 
 * @returns Whether of not the form can be submitted in its current state.
 */
function validateProfile() {

	var password = document.getElementById("password").value;
	var repassword = document.getElementById("repassword").value;
	var name = document.getElementById("name").value;
	var telephone = document.getElementById("telephone").value;

	if (name == "") {
		alert("Full name must be filled out");
		return false;
	}

	if (telephone == "") {
		alert("Telephone number must be filled out");
		return false;
	}

	var phoneRegex = /^[0-9]{11}$/;

	if (!telephone.test(phoneRegex)) {
		alert("Telephone number must be valid.");
		return false;
	}

	if (password != "" && password.length < 8) {
		alert("Password must be at least 8 charaters long.");
		return false;
	}

	if (password.length > 30) {
		alert("Password must be less than 30 charaters long.");
		return false;
	}

	document.getElementById("password").value = calcMD5(password);

	return true;

}