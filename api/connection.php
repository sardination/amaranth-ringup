<?php
include("credentials.php");

$servername = "localhost";

// Create connection
$dsn = 'mysql:dbname=' . $dbname . ';host=' . $servername;
$conn = new PDO($dsn, $username, $password);
// Check connection - PDO auto-logs connection errors
// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }
?>