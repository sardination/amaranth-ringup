<?php
// UNCOMMENT ONLY FOR DEBUGGING
// error_reporting(E_ALL);
// ini_set('display_errors', '1');

include 'connection.php';
include 'session.php';

// Include all controller classes
include 'controllers/AbstractController.php';
$dir = new DirectoryIterator("controllers");
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot() && $fileinfo->getFilename() != "AbstractController.php") {
        include 'controllers/' . $fileinfo->getFilename();
    }
}

// Include all gateway classes
include 'gateways/AbstractGateway.php';
$dir = new DirectoryIterator("gateways");
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot() && $fileinfo->getFilename() != "AbstractGateway.php") {
        include 'gateways/' . $fileinfo->getFilename();
    }
}

use controllers\ProductController;
use controllers\LoginController;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

// Remove domain from consideration
array_splice($uri, 0, 1);

// Just use URL after `api`
if ($uri[0] == 'ringup') {
    array_splice($uri, 0, 1);
}

if ($uri[0] != 'api') {
    header("HTTP/1.1 404 Not Found");
    exit();
}

$path = $uri[1];

$requestMethod = $_SERVER["REQUEST_METHOD"];

if ($path == 'login') {
    $controller = new LoginController($conn, $requestMethod);
} else if ($path == 'product') {
    $controller = new ProductController($conn, $requestMethod);
} else {
    header("HTTP/1.1 404 Not Found");
    exit();
}

$controller->processRequest();

?>