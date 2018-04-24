/**
 * Checks that the fields from the login form are populated and valid.
 * 
 * @returns Whether of not the form can be submitted in its current state.
 */
function validateLogin() {

	var email = document.getElementById("login_email").value;
	var password = document.getElementById("login_password").value;

	if (email == "") {
		alert("Email must be filled out");
		return false;
	}

	if (password == "") {
		alert("Password must be filled out");
		return false;
	}

	if (password.length < 8) {
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

/**
 * Checks that all the fields of the sign up form are valid and populated.
 * 
 * @returns Whether or not the form can be submitted in its current state.
 */
function validateSignup() {

	var email = document.getElementById("signup_email").value;
	var password = document.getElementById("signup_password").value;
	var repassword = document.getElementById("signup_repassword").value;
	var name = document.getElementById("signup_name").value;
	var dob = document.getElementById("signup_dob").value;
	var telephone = document.getElementById("signup_telephone").value;

	if (email == "") {
		alert("Email must be filled out");
		return false;
	}

	if (password == "") {
		alert("Password must be filled out");
		return false;
	}

	if (repassword == "") {
		alert("Retype Password must be filled out");
		return false;
	}

	if (name == "") {
		alert("Full name must be filled out");
		return false;
	}

	if (dob == "") {
		alert("Data of birth must be filled out");
		return false;
	}

	if (telephone == "") {
		alert("Telephone number must be filled out");
		return false;
	}

	var phoneRegex = /^[0-9]{11}$/;

	if (!phoneRegex.test(telephone.toString())) {
		alert("Telephone number must be valid.");
		return false;
	}

	if (password.length < 8) {
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