<?php
namespace controllers;

class LoginController extends AbstractController {

    public function __construct($conn, $requestMethod)
    {
        parent::__construct($conn, $requestMethod);
    }

    /* OVERRIDE - only support POST and don't require user to be already logged in */
    public function processRequest()
    {
        switch ($this->requestMethod) {
            case 'GET':
                $response = $this->isLoggedIn();
                break;
            case 'POST':
                $response = $this->login();
                break;
            case 'DELETE':
                $response = $this->logout();
                break;
            case 'OPTIONS':
                $response['status_code_header'] = 'HTTP/1.1 200 OK';
                break;
            default:
                $response = $this->notFoundResponse();
                break;
        }
        header($response['status_code_header']);
        if (isset($response['body'])) {
            echo $response['body'];
        }
    }

    private function isLoggedIn() {
        /*
            Check if the user is logged in and return the logged in user
        */

        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = $this->session->getIsLoggedIn();

        return $response;
    }

    private function login() {
        /*
            Check if user exists in db with given full name and password.
            Username and password are case-sensitive
        */
        $username_hash = "4663e84fea2915e34413e6710715d59f54caf9bc"; // indhu
        // $password_hash = "227115a26394e6c2934adef54ca12aedc9335133"; // amaranth22814whr
        $password_hash = "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8"; // TEMP - password

        $input = (array) json_decode(file_get_contents('php://input'), TRUE);
        $username = $input['username'];
        $hashed_password = $input['password'];

        if (sha1($username) != $username_hash || $hashed_password != $password_hash) {
            return $this->notFoundResponse();
        }

        $this->session->setIsLoggedIn(true);

        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        return $response;
    }

    private function logout()
    {
        $this->session->destroy();

        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        return $response;
    }

    protected function validateItem(&$input)
    {
        // no-op
        return true;
    }

    protected function convertRowTypes(&$row) {
        // no-op
    }
}