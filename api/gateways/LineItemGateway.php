<?php
namespace gateways;

class LineItemGateway extends AbstractGateway {
    // NOTE: unit_price is stored in cents so that we can store it as an integer

    public function findAll($input)
    {
        $statement = "
            SELECT
                id, transaction_id, product_name, quantity, unit, unit_price
            FROM
                line_item
        ";

        $bind_types = '';
        $bind_args = [];

        $where_statement = "";

        if (isset($input["transaction_id"])) {
            $where_statement = "transaction_id = ?";
            $bind_types = $bind_types . "i";
            array_push($bind_args, $input["transaction_id"]);
        }

        if (strlen($where_statement) > 0) {
            $statement = $statement . " WHERE " . $where_statement;
        }

        if (!isset($input["aggregate"])) {
            $statement = $statement . " ORDER BY transaction_id";
        } else {
            $statement = $statement . " GROUP BY line_item.product_name";
        }

        return $this->getRows($statement, $bind_types, $bind_args);
    }

    public function find($id)
    {
        $statement = "
            SELECT
                id, transaction_id, product_name, quantity, unit, unit_price
            FROM
                line_item
            WHERE id = ?
        ";

        $ret = $this->getRows($statement, 'i', [$id]);

        if (count($ret) > 0) {
            $ret = $ret[0];
        } else {
            $ret = null;
        }

        return $ret;
    }

    public function insert(Array $input)
    {
        $statement = "
            INSERT INTO line_item
                (transaction_id, product_name, quantity, unit, unit_price)
            VALUES
                (?, ?, ?, ?, ?)
        ";
        $ret = $this->updateTable($statement, 'isssi', [$input['transaction_id'], $input['product_name'], $input['quantity'], $input['unit'], $input['unit_price']]);
        if ($ret > 0) {
            return $this->find($this->conn->lastInsertId());
        }

        return null;
    }

    public function update(Array $input)
    {
        /*
            Use PUT for any user updating their latest work entry, or adding a new starting work entry
            This doesn't quite follow REST schema, but works for us here.

            For this particular endpoint, the PUT request returns the actual work entry if it
            was successfully inserted or updated, instead of just the row count. If unsuccessful,
            it returns null.
        */

        $existing_item = $this->find($input['id']);

        if (count($existing_item) == 0) {
            $statement = "
                INSERT INTO line_item
                    (transaction_id, product_name, quantity, unit, unit_price)
                VALUES
                    (?, ?, ?, ?, ?)
            ";
            $ret = $this->updateTable($statement, 'isssi', [$input['transaction_id'], $input['product_name'], $input['quantity'], $input['unit'], $input['unit_price']]);

            if ($ret > 0) {
                return $this->find($this->conn->lastInsertId());
            }

            return null;
        }

        $statement = "
            UPDATE line_item
            SET
                transaction_id = ?,
                product_name = ?,
                quantity = ?,
                unit = ?,
                unit_price = ?
            WHERE id = ?
        ";
        $ret = $this->updateTable($statement, 'isssii', [$input['transaction_id'], $input['product_name'], $input['quantity'], $input['unit'], $input['unit_price'], $input["id"]]);

        if ($ret > 0) {
            return $this->find($input["id"]);
        }

        return null;
    }

    public function delete(Array $input)
    {
        /*
            This needs to have a worker_id input in addition to the id itself
        */

        $statement = "
            DELETE FROM line_item
            WHERE id = ?
        ";

        return $this->updateTable($statement, 'i', [$input['id']]);
    }
}