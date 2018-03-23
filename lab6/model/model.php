<?php

include_once("model/account.php");

class Model {

    private $server;
    private $dbname;
    private $username;
    private $password;
    private $pdo;

    public function __construct($server, $dbname, $username, $password) {
		$this->pdo=null;
        $this->server = $server;
        $this->dbname = $dbname;
        $this->username = $username;
        $this->password = $password;
    }

    //Connect function to create a db connection
    public function connect() {
        try{
			$this->pdo = new PDO("mysql:host=$this->server;dbname=$this->dbname", "$this->username", "$this->password");
			$this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		} catch (PDOException $ex) {
			echo "<p> a database error occurred: <em> <?= $ex->getMessage() ?> </em></p>";
		}
    }

    //Function to get user by id, returns an account object
    public function getAccountById($id) {
        $query = "SELECT * from savings WHERE id='$id'";
		try {
			$rows = $this->pdo-> query($query);
			if ($rows && $rows->rowCount() ==1) {
				$row=$rows->fetch();
				$account=new Account($row["id"], $row["balance"]);
				return $account;
			}
			else return null;
		} catch (PDOException $ex) {
			echo "<p> database error occurred: <em> $ex->getMessage() </em></p>";
		}
	}

	//Function to update balance of user id
    public function withdraw($id, $amount) {
		$query = "SELECT * from savings WHERE id='$id'";
		try {
			$rows = $this->pdo-> query($query);
			if ($rows && $rows->rowCount() ==1) {
				$row=$rows->fetch();
				if ($row['balance']>=$amount){
					$balance = $row['balance'] - $amount;
					$query = "update savings set balance=$balance where id='$id'";
					$result = $this->pdo-> exec($query);
					
					if ($result) return $balance;
				}
			} 
			return null;
		} catch (PDOException $ex) {
			echo "<p> database error occurred: <em> $ex->getMessage() </em></p>";
		}
    }
	
	
	//Function to deposit amount to account id
    public function deposit($id, $amount) {
        $query = "SELECT * from savings WHERE id='$id'";
		
		try {
			$rows = $this->pdo-> query($query);
			if ($rows && $rows->rowCount() ==1) {
				$row=$rows->fetch();
				$balance = $row['balance'] + $amount;
				$query = "update savings set balance=$balance where id='$id'";
				$result = $this->pdo-> exec($query);
					
				if ($result) return $balance;
			}
			return null;
		} catch (PDOException $ex) {
			echo "<p> database error occurred: <em> $ex->getMessage() </em></p>";
		}
	}
}
?>