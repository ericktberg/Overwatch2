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
    function __construct($method) {
        $dsn = "mysql:host=$this->host;dbname=$this->db;charset=$this->charset";
        $opt = [
            PDO::ATTR_ERRMODE=> PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE=> PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES=> false
        ];
        
        $this->pdo = new PDO($dsn, $this->user, $this->pass, $opt);
        
        /* Take the fields from the proper construct
         * Fields for the query will be located under INPUT_POST unless it is a GET request, in which case they will be located under INPUT_GET
         */
        $input = null;
        if ($method == 'GET') {
            $input = INPUT_GET;
        } 
        else {
            $input = INPUT_POST;
        }
        $this->getFields($input);
    }
    
    /* Gather all the fields associated with the resource from the post or get params
     * 
     */
    abstract public function getFields($input);
    
    abstract public function create();
    
    abstract public function read();
    
    abstract public function update();
    
    abstract public function delete();
    

}

/*
    /* Given a single dimensional assoc array of name:value pairs
     * Output an appropriate SELECT clause for a sql query
     *
    private function selectClause($fields) {
        $select = " SELECT ";
        foreach ($fields as $name) {
            $select .= " $name ";
        }
       
        return $select;
    }
    
    /* Given a single dimensional assoc array of name:value pairs
     * Output an appropriate WHERE clause for a SQL query 
     *
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
*/

?>

