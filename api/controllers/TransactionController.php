<?php
namespace controllers;

use gateways\TransactionGateway;

class TransactionController extends AbstractController {

    public function __construct($conn, $requestMethod)
    {
        parent::__construct($conn, $requestMethod);

        $this->gateway = new TransactionGateway($this->conn, $this->session);
    }

    protected function validateItem(&$input)
    {
        if (!isset($input['complete_time'])) {
            return false;
        }
        return true;
    }

    protected function convertRowTypes(&$row) {
        if (empty($row)) {
            return;
        }
        if (isset($row['id'])) {
            $row['id'] = (int)$row['id'];
        }
    }
}