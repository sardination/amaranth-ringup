<?php
namespace controllers;

abstract class AbstractController {

    protected $conn;
    protected $requestMethod;

    protected $session;

    protected $gateway;

    protected function __construct($conn, $requestMethod)
    {
        $this->conn = $conn;
        $this->requestMethod = $requestMethod;

        $this->session = new \Session($conn);
    }

    public function processRequest()
    {
        if (!$this->session->getIsLoggedIn()) {
            $response = $this->notFoundResponse();
        } else {
            switch ($this->requestMethod) {
                case 'GET':
                    $response = $this->getItems();
                    break;
                case 'POST':
                    $response = $this->createItemFromRequest();
                    break;
                case 'PUT':
                    $response = $this->updateItemFromRequest();
                    break;
                case 'DELETE':
                    $response = $this->deleteItem();
                    break;
                case 'OPTIONS':
                    $response['status_code_header'] = 'HTTP/1.1 200 OK';
                    break;
                default:
                    $response = $this->notFoundResponse();
                    break;
            }
        }

        header($response['status_code_header']);
        if ($response['body']) {
            echo $response['body'];
        }
    }

    private function getItems()
    {
        $input = $_GET;
        $result = null;
        if (!isset($input["id"])) {
            $result = $this->gateway->findAll($input);
            for ($i = 0; $i < count($result); $i++) {
                $this->convertRowTypes($result[$i]);
            }
        } else {
            $result = $this->gateway->find($input["id"]);
            $this->convertRowTypes($result);
        }
        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = json_encode($result);
        return $response;
    }

    private function createItemFromRequest()
    {
        $input = (array) json_decode(file_get_contents('php://input'), TRUE);
        if (!$this->validateItem($input)) {
            return $this->unprocessableEntityResponse();
        }
        $result = $this->gateway->insert($input);
        $this->convertRowTypes($result);
        $response['status_code_header'] = 'HTTP/1.1 201 Created';
        $response['body'] = json_encode($result);
        return $response;
    }

    private function updateItemFromRequest()
    {
        $input = (array) json_decode(file_get_contents('php://input'), TRUE);

        // If the input contains an id, check if that item exists in the db
        if (isset($input["id"])) {
            $result = $this->gateway->find($input["id"]);
            if (!$result) {
                return $this->notFoundResponse();
            }

            // Only validate if the PUT request is to update an existing entry
            if (!$this->validateItem($input)) {
                return $this->unprocessableEntityResponse();
            }
        }

        $result = $this->gateway->update($input);
        $this->convertRowTypes($result);
        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = json_encode($result);
        return $response;
    }

    private function deleteItem()
    {
        $input = $_GET;

        // If the input contains an id, check if that item exists in the db
        if (isset($input["id"])) {
            $result = $this->gateway->find($input["id"]);
            if (!$result) {
                return $this->notFoundResponse();
            }
        }

        $result = $this->gateway->delete($input);
        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = $result;
        return $response;
    }

    abstract protected function validateItem(&$input);

    // Convert non-string to prepare for json encode
    abstract protected function convertRowTypes(&$row);

    private function unprocessableEntityResponse()
    {
        $response['status_code_header'] = 'HTTP/1.1 422 Unprocessable Entity';
        $response['body'] = json_encode([
            'error' => 'Invalid input'
        ]);
        return $response;
    }

    protected function notFoundResponse()
    {
        $response['status_code_header'] = 'HTTP/1.1 404 Not Found';
        $response['body'] = null;
        return $response;
    }
}

?>