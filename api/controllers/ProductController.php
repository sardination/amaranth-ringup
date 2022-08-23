<?php
namespace controllers;

use gateways\ProductGateway;

class ProductController extends AbstractController {

    public function __construct($conn, $requestMethod)
    {
        parent::__construct($conn, $requestMethod);

        $this->gateway = new ProductGateway($this->conn, $this->session);
    }

    protected function validateItem(&$input)
    {
        if (!isset($input['name'])) {
            return false;
        }
        if (!isset($input['unit_price'])) {
            return false;
        }
        if (!isset($input['unit'])) {
            return false;
        }
        return true;
    }

    protected function convertRowTypes(&$row) {
        if (empty($row)) {
            return;
        }
        $row['id'] = (int)$row['id'];
        $row['unit_price'] = (int)$row['unit_price'];
    }
}