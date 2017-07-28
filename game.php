<?php
/* PHP file that handles queries
 * Possibly split into two at some point (or use functions?) to handle graph and map differences
 * Takes parameters from UI of website and queries database, returning json structured
 *
 */
include_once 'resource.php';

class Game extends Resource {

    public function read($resource, $fields) {
        $player = $fields['player'];
        $date = $fields['date'];
        $playerSR = $fields['playerSR'];
        $teamSR = $fields['teamSR'];
        $enemySR = $fields['enemySR'];
        
        $sql = " SELECT g.gameID FROM overwatch.game g\n"
            . " WHERE date=STR_TO_DATE( ? , '%m/%d/%Y')\n"
            . " AND player = ? \n"
            . " AND playerElo= ? \n"
            . " AND teamElo= ? \n"
            . " AND enemyTeamElo= ? ;\n";
        
        $readGame = $this->pdo->prepare($sql);
        $readGame->execute([$date, $player, $playerSR, $teamSR, $enemySR]);
        
       return $readGameResult = $readGame->fetch();        
    }
    
    public function create($resource, $fields) {
        $player = $fields['player'];
        $date = $fields['date'];
        $playerSR = $fields['playerSR'];
        $teamSR = $fields['teamSR'];
        $enemySR = $fields['enemySR'];

        /* Create the player if they don't exist 
         * 
         * TODO: make this not necessary
         */
        $sql = " INSERT IGNORE INTO overwatch.player\n"
                . " SET playerName= ? "
                . ", pro= ? ;\n";

        $writePlayer = $this->pdo->prepare($sql);
        $writePlayer->execute([$player, 0]);

        /* Check for previously created games */
        $readGameResult = $this->read($resource, $fields);
        
        if ($readGameResult) {
            return $readGameResult;
        }
        else {
            /* TODO: Handle optional params */
            $sql = " INSERT INTO overwatch.game\n"
                    . " SET date = STR_TO_DATE( ? , '%m/%d/%Y'),"
                    . " player = ? \n"
                    . " AND playerElo= ? \n"
                    . " AND teamElo= ? \n"
                    . " AND enemyTeamElo= ? ;\n";
            
            $writeGame = $this->pdo->prepare($sql);
            /* TODO: is this blocking? It needs to otherwise the last read will return stupid values. */
            $writeGame->execute([$date, $player, $playerSR, $teamSR, $enemySR]);
            
            return $this->read($resource, $fields);
        }
    }  
    
    public function update($resource, $fields) {
        return false;
    }
    
    public function delete($resource, $fields) {
        return false;
    }
}
?>