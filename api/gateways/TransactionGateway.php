<?php
namespace gateways;

class TransactionGateway extends AbstractGateway {
    public function findAll($input)
    {
        $statement = "
            SELECT
                id, complete_time
            FROM
                transaction
        ";

        if (isset($input["aggregate"])) {
            $statement = "
                SELECT
                    line_item.product_name, SUM(line_item.quantity) AS quantity, line_item.unit, line_item.unit_price
                FROM
                    line_item
                LEFT JOIN
                    transaction
                ON
                    transaction.id = line_item.transaction_id
            ";
        }

        $bind_types = '';
        $bind_args = [];

        $where_statement = "";

        if (isset($input["time_range_start"])) {
            if (isset($input["time_range_end"])) {
                // both time range start and time range end are set
                $where_statement = "complete_time >= ? AND complete_time <= ?";
                $bind_types = $bind_types . "ss";
                array_push($bind_args,
                    $input["time_range_start"],
                    $input["time_range_end"]
                );
            } else {
                // only time range start is set
                $where_statement = "complete_time >= ?";
                $bind_types = $bind_types . "s";
                array_push($bind_args, $input["time_range_start"]);
            }
        } else if (isset($input["time_range_end"])) {
            // only time range end is set
            $where_statement = "complete_time <= ?";
            $bind_types = $bind_types . "s";
            array_push($bind_args, $input["time_range_end"]);
        }

        if (strlen($where_statement) > 0) {
            $statement = $statement . " WHERE " . $where_statement;
        }

        if (!isset($input["aggregate"])) {
            $statement = $statement . " ORDER BY complete_time";
        } else {
            $statement = $statement . "GROUP BY
                    line_item.product_name, line_item.unit, line_item.unit_price";
        }

        return $this->getRows($statement, $bind_types, $bind_args);
    }

    public function find($id)
    {
        $statement = "
            SELECT
                id, complete_time
            FROM
                transaction
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
            INSERT INTO transaction
                (complete_time)
            VALUES
                (?)
        ";
        $ret = $this->updateTable($statement, 's', [$input['complete_time']]);
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
                INSERT INTO transaction
                    (complete_time)
                VALUES
                    (?)
            ";
            $ret = $this->updateTable($statement, 's', [$input['complete_time']]);

            if ($ret > 0) {
                return $this->find($this->conn->lastInsertId());
            }

            return null;
        }

        // Do not allow changes to the transaction time

        return null;
    }

    public function delete(Array $input)
    {
        /*
            This needs to have a worker_id input in addition to the id itself
        */

        $statement = "
            DELETE FROM transaction
            WHERE id = ?
        ";

        return $this->updateTable($statement, 'i', [$input['id']]);
    }
}