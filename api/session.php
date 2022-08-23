<?php

class Session {
    private $salt = "4mAr4/\\/tH&";
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;

        session_start();
    }

    public function getIsLoggedIn() {
        return isset($_SESSION["logged_in"]) && $_SESSION["logged_in"];
    }

    public function setIsLoggedIn($logged_in) {
        $_SESSION["logged_in"] = $logged_in;
    }

    public function destroy() {
        session_destroy();
    }
}

?>