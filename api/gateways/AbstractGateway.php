<?php
namespace gateways;

abstract class AbstractGateway {

    protected $conn = null;
    protected $session = null;

    public function __construct($conn, $session)
    {
        $this->conn = $conn;
        $this->session = $session;
    }

    protected function executeSQL($statement, $bind_types = null, $bind_args = null) {
        /*
            Execute SQL and bind params, if any.

            Arguments:
                statement (string): SQL statement to be executed. Can contain "?" characters

            Keyword Arguments:
                bind_types (string): the types to sit in for the "?" characters
                bind_args (array): the arguments to sit in for the "?" characters

            Returns:
                SQL execution result
        */

        $bind_map = array(
            's' => \PDO::PARAM_STR,
            'i' => \PDO::PARAM_INT
        );

        $statement = $this->conn->prepare($statement);
        if ($bind_types != null && $bind_args != null) {
            $bind_index = 0;
            foreach (str_split($bind_types) as $bind_type) {
                $statement->bindParam($bind_index + 1, $bind_args[$bind_index], $bind_map[$bind_type]);
                $bind_index += 1;
            }
        }
        $statement->execute();

        return $statement;
    }

    protected function getRows($statement, $bind_types = null, $bind_args = null) {
        /*
            Run a statement and return rows, or empty array on failure

            Arguments:
                statement (string): SQL statement to be executed. Can contain "?" characters

            Keyword Arguments:
                bind_types (string): the types to sit in for the "?" characters
                bind_args (array): the arguments to sit in for the "?" characters

            Returns:
                Array of rows from running statement, or empty array on failure
        */

        try {
            return $this->executeSQL($statement, $bind_types, $bind_args)->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            // exit($e->getMessage());
            return [];
        }
    }

    protected function updateTable($statement, $bind_types = null, $bind_args = null) {
        /*
            Run a statement and return the row count, or 0 on failure

            Arguments:
                statement (string): SQL statement to be executed. Can contain "?" characters

            Keyword Arguments:
                bind_types (string): the types to sit in for the "?" characters
                bind_args (array): the arguments to sit in for the "?" characters

            Returns:
                Row count on success, or 0 on failure
        */

        try {
            return $this->executeSQL($statement, $bind_types, $bind_args)->rowCount();
        } catch (\PDOException $e) {
            error_log(print_r($e->getMessage(), true));
            // exit($e->getMessage());
            return 0;
        }
    }
}

?>