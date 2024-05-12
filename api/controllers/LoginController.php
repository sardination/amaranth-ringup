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
      
        //for local testing 
		/*
		$username_hash = "4663e84fea2915e34413e6710715d59f54caf9bc"; // TEMP - indhu
        $password_hash = "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8"; // TEMP - password
		*/

	
		$username_hash = "974760ce57c52dcee788e0ae0f86c84900a338e1"; 
        $password_hash = "0460534b06c41443eeabff49e956d8599dc48ff1"; 
		

        $input = (array) json_decode(file_get_contents('php://input'), TRUE);
        $username = $input['username'];
        $hashed_password = $input['password'];

        if (sha1($username) != $username_hash || $hashed_password != $password_hash) {
            return $this->notFoundResponse();
        }

        $this->session->setIsLoggedIn(true);

        $response['status_code_header'] = 'HTTP/1.1 200 OK';
        $response['body'] = true;
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