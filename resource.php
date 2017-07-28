<?php
/* All resources must implement CRUD principles.
 * 
 */
abstract class Resource {
    /* Database values are set and edited here, in one place
     * TODO: change password to 'password' in database
     */
    private $host = 'localhost';
    private $db = 'overwatch';
    private $user = 'root';
    private $pass = 'monkeybrains';
    private $charset = 'utf8';
    
    protected $pdo;

    /* Overwrite constructor to connect to database
     * Set the pdo object for all future use. 
     */
    function __construct() {
        $dsn = "mysql:host=$this->host;dbname=$this->db;charset=$this->charset";
        $opt = [
            PDO::ATTR_ERRMODE=> PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE=> PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES=> false
        ];
        
        $this->pdo = new PDO($dsn, $this->user, $this->pass, $opt);
    }
    
    /* Given a single dimensional assoc array of name:value pairs
     * Output an appropriate SELECT clause for a sql query
     */
    private function selectClause($fields) {
        $select = " SELECT ";
        foreach ($fields as $name) {
            $select .= " $name ";
        }
       
        return $select;
    }
    
    /* Given a single dimensional assoc array of name:value pairs
     * Output an appropriate WHERE clause for a SQL query 
     */
    private function whereClause($fields) {
        $where = " WHERE ";
        foreach($fields as $name) {
            if ($where == " WHERE ") {
                $where .= " $name=?\n ";
            }
            else {
                $where .= " AND $name=?\n ";
            }
        }
        
        return $where;
    }
    
    abstract public function create($resource, $fields);
    
    abstract public function read($resource, $fields);
    
    abstract public function update($resource, $fields);
    
    abstract public function delete($resource, $fields);
    

}
?>