

<?php
# An Account object corresponds to the columns in table savings
class Account {
  private $id=null;
  private $balance=null;
  
  # Creates a new account with the given name balance
  public function __construct($id, $balance) {
    $this->id = $id;
    $this->balance = $balance;
  }
  
  # __get method
  public function __get($var){
	return $this->$var;
  }
  
 
}
?>
