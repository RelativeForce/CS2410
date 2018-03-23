<?php
if (isset($_POST["balance"])) {
//Get balance of user id 
$account = $this->model->getAccountById($_POST["id"]);
$balance = $account->balance;

//Display balance
if ($balance != null) {
    echo "<b><h3>Your balance is: &pound; $balance</h3></b>";
} else {
    echo "<p>Sorry, there is an error. Please try again.</p>";
}
}
else {

?>
<h1>Balance</h1>
<form method="post" action="">
<div>
        Please enter the account ID<input type="text" name="id"/>
        <input type="submit" name="balance" value="balance">
</div>
</form>

<?php 
}
?>