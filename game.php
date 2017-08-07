<?php
/* PHP file that handles queries
 * Possibly split into two at some point (or use functions?) to handle graph and map differences
 * Takes parameters from UI of website and queries database, returning json structured
 *
 */
include_once 'resource.php';

class Game extends Resource {
    private $gameID;
    private $player;
    private $date;
    private $playerSR;
    private $teamSR;
    private $enemySR;
    private $videoURL;
    private $map;

    public function getFields($input) {
        $this->gameID = filter_input($input, "gameID");
        $this->player = filter_input($input, "player");
        $this->date = filter_input($input, "date");
        $this->playerSR = filter_input($input, "playerSR");
        $this->teamSR = filter_input($input, "teamSR");
        $this->enemySR = filter_input($input, "enemySR");
        $this->videoURL = filter_input($input, "videoURL");
        $this->map = filter_input($input, "map");
    }
    
    /* Basic read function of CRUD. 
     * Return assoc array result set of correlating row if exists, false otherwise
     * 
     */
    public function read() {
        $params = []; 
        $sql = " SELECT gameID, player, date, map, playerElo, teamElo, enemyTeamElo, videoURL "
                . " FROM overwatch.game\n"
                . " WHERE 1=1 ";
        
        if ($this->gameID) {
            $sql .= " AND gameID= ? \n";
            array_push($params, $this->gameID);
        }
        if ($this->player) {
            $sql .= " AND player= ? \n";
            array_push($params, $this->player);
        }
        if ($this->date) {
            $sql .= " AND date= STR_TO_DATE( ? , '%m/%d/%Y') \n";
            array_push($params, $this->date);
        }
        if ($this->playerSR) {
            $sql .= " AND playerElo= ? \n";
            array_push($params, $this->playerSR);
        }
        if ($this->teamSR) {
            $sql .= " AND teamElo= ? \n";
            array_push($params, $this->teamSR);
        }
        if ($this->enemySR) {
            $sql .= " AND enemyTeamElo= ? \n";
            array_push($params, $this->enemySR);
        }
        if ($this->map) {
            $sql .= " AND map= ? \n";
            array_push($params, $this->map);
        }
        
        $readGame = $this->pdo->prepare($sql);
        $readGame->execute($params);
        
       return $readGame->fetch();        
    }
    
    /* Create a game given the primary key information. Return the gameID of the game with these criteria
     *      1. Validate required information +
     *      2. Check if game exists already
     *      3. Create/Get gameID
     * 
     * return assoc array of correlating row created, false otherwise
     */
    public function create() {
        
        /* Create the player if they don't exist 
         * 
         * TODO: make this not necessary
         */
        $sql = " INSERT IGNORE INTO overwatch.player\n"
                . " SET playerName= ? "
                . ", pro= ? ;\n";

        $writePlayer = $this->pdo->prepare($sql);
        $writePlayer->execute(array($this->player, 0));

        /* Check for previously created games */
        $readGameResult = $this->read();
        
        if ($readGameResult) {
            // The game already exists, mission accomplished
            return $readGameResult;
        }
        else {
            /* There is not a game with these params already 
             * TODO: Handle optional params 
             */
            
            $params = [];
            $sql = " INSERT INTO overwatch.game\n"
                    . " SET ";
            
            if ($this->player) {
                $sql .= " player= ? ,";
                array_push($params, $this->player);
            }
            if ($this->date) {
                $sql .= " date= STR_TO_DATE( ? , '%m/%d/%Y') ,";
                array_push($params, $this->date);
            }
            if ($this->playerSR) {
                $sql .= " playerElo= ? ,";
                array_push($params, $this->playerSR);
            }
            if ($this->teamSR) {
                $sql .= " teamElo= ? ,";
                array_push($params, $this->teamSR);
            }
            if ($this->enemySR) {
                $sql .= " enemyTeamElo= ? ,";
                array_push($params, $this->enemySR);
            }
            if ($this->map) {
                $sql .= " map= ? ,";
                array_push($params, $this->map);
            }
            
            // Strip the last comma from the query
            $writeGame = $this->pdo->prepare(substr($sql, 0, -1));
            
            $writeGame->execute($params);
            
            // TODO: don't read again, jfc.
            return $this->read();
        }
    }  
    
    public function update() {
        return false;
    }
    
    public function delete() {
        return false;
    }
}
?>