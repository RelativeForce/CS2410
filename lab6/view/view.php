<?php

class View {

    public $page = null;
    public $model = null;

    function __construct($model) {
        $this->model = $model;
    }

    function display() {
        
		require_once("menu.php");
		
        if (isset($_GET["page"]))
		{
            $this->page = "view/" . $_GET["page"] . ".php";
			require($this->page);
 
		}
	}
  
}

?>
