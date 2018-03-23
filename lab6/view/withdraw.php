

<?php
//get amount entered and fetch the new balance
if (isset($_POST["withdraw"])) {
	if (preg_match ('/^[0-9]+$/',trim($_POST["amount"]))){ 
		//update balance of user id
		$balance = $this->model->withdraw($_POST["id"], $_POST["amount"]);

	    //Display the new balance
		if ($balance != null) {
			echo "<b><h3>Your New balance is: &pound; $balance</h3></b>";
		} else echo "<p>Sorry, transaction failure.</p>";
	} else { //validation fail
			   echo "<p>Sorry, Please enter a postive integer.</p>";
	}
} else {//display the form	
?>
<h1>Withdraw</h1>
<form method="post" action="">
<div>
        Please enter the account ID
		<input type="text" name="id"/> <br><br>
		Please enter the amount to withdraw
		<input type="text" name="amount"/>
        <input type="submit" name="withdraw" value="withdraw">
		</div>
</form>
<?php
}
?>	
	

	