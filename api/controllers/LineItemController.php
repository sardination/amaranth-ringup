<?php
namespace controllers;

use gateways\LineItemGateway;

class LineItemController extends AbstractController {

    public function __construct($conn, $requestMethod)
    {
        parent::__construct($conn, $requestMethod);

        $this->gateway = new LineItemGateway($this->conn, $this->session);
    }

    protected function validateItem(&$input)
    {
        if (!isset($input['transaction_id'])) {
            return false;
        }
        if (!isset($input['product_name'])) {
            return false;
        }
        if (!isset($input['quantity'])) {
            return false;
        }
        if (!isset($input['unit'])) {
            return false;
        }
        if (!isset($input['unit_price'])) {
            return false;
        }
        return true;
    }

    protected function convertRowTypes(&$row) {
        if (empty($row)) {
            return;
        }
        $row['id'] = (int)$row['id'];
        $row['transaction_id'] = (int)$row['transaction_id'];
        $row['quantity'] = (float)$row['quantity'];
        $row['unit_price'] = (int)$row['unit_price'];
    }
}