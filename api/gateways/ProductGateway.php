<?php
namespace gateways;

class ProductGateway extends AbstractGateway {
    // NOTE: unit_price is stored in cents so that we can store it as an integer

    public function findAll()
    {
        $statement = "
            SELECT
                id, name, unit_price, unit
            FROM
                product
        ";

        return $this->getRows($statement, '', []);
    }

    public function find($id)
    {
        $statement = "
            SELECT
                id, name, unit_price, unit
            FROM
                product
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
            INSERT INTO product
                (name, unit_price, unit)
            VALUES
                (?, ?, ?)
        ";
        $ret = $this->updateTable($statement, 'sis', [$input['name'], $input['unit_price'], $input['unit']]);
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
                INSERT INTO product
                    (name, unit_price, unit)
                VALUES
                    (?, ?, ?)
            ";
            $ret = $this->updateTable($statement, 'sis', [$input['name'], $input['unit_price'], $input['unit']]);

            if ($ret > 0) {
                return $this->find($this->conn->lastInsertId());
            }

            return null;
        }

        $statement = "
            UPDATE product
            SET
                name = ?,
                unit_price = ?,
                unit = ?
            WHERE id = ?
        ";
        $ret = $this->updateTable($statement, 'sisi', [$input["name"], $input["unit_price"], $input["unit"], $input["id"]]);

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
            DELETE FROM product
            WHERE id = ?
        ";

        return $this->updateTable($statement, 'i', [$input['id']]);
    }
}