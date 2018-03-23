<?php
include_once("model/model.php");
include_once("view/view.php");

class Controller {
	public $model=null;
	public $view = null;
	
	function __construct() {  
		$this->model = new Model("localhost", "banking", "root", "");
        $this->model->connect();
        $this->view = new View($this->model);
    } 
	
	function invoke() {
		
		if (isset($_POST['ID'])) {
            //if user submit form, get account from model
		
            $account = $this->model->getAccountById($_POST["id"]);

            if ($account != null) {
                header("Location: index.php");
            }else { //display menu page
			   echo "<p>Invalid id</p>";
			   $this->view->display();
			}
        } else {  
			//display menu page
			$this->view->display();
		}
   }


}

?>
