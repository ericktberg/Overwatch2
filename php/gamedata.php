<?php
include_once 'resource.php';
include_once 'game.php';

class GameData extends Resource {
    private $gameID;
    private $playerHero;
    private $enemyHero;
    private $method;
    private $mode;
    private $side;
    private $playerX;
    private $playerY;
    private $playerZ;
    private $enemyX;
    private $enemyY;
    private $enemyZ;
    
    public function getFields($input) {
        $this->gameID = filter_input($input, "gameID");
        $this->playerX = filter_input($input, "playerX");
        $this->playerY = filter_input($input, "playerY");
        $this->playerZ = filter_input($input, "playerZ");
        $this->enemyX = filter_input($input, "enemyX");
        $this->enemyY = filter_input($input, "enemyY");
        $this->enemyZ = filter_input($input, "enemyZ");
        $this->mode = filter_input($input, "mode");
        $this->side = filter_input($input, "side");
        $this->playerHero = filter_input($input, "playerHero");
        $this->enemyHero = filter_input($input, "enemyHero");
        $this->method = filter_input($input, "method");
    }
    
    public function create() {
        // Requires gameID to be set.
        if ((new Game('POST'))->read()) {
            $params = [];
            $sql = " INSERT INTO overwatch.gamedata \n"
                    . " SET ";
            
            if ($this->gameID) {
                $sql .= " gameID= ? ,";
                array_push($params, $this->gameID);
            }
            if ($this->playerHero) {
                $sql .= " playerCharacter= ? ,";
                array_push($params, $this->playerHero);
            }
            if ($this->enemyHero) {
                $sql .= " enemyCharacter= ? ,";
                array_push($params, $this->enemyHero);
            }
            if ($this->mode) {
                $sql .= " interaction= ? ,";
                array_push($params, $this->mode);
            }
            if ($this->side) {
                $sql .= " side= ? ,";
                array_push($params, $this->side);
            }
            if ($this->method) {
                $sql .= " method= ? ,";
                array_push($params, $this->method);
            }
            if ($this->playerX) {
                $sql .= " playerX= ? ,";
                array_push($params, $this->playerX);
            }
            if ($this->playerY) {
                $sql .= " playerY= ? ,";
                array_push($params, $this->playerY);
            }
            if ($this->playerZ) {
                $sql .= " playerZ= ? ,";
                array_push($params, $this->playerZ);
            }
            if ($this->enemyX) {
                $sql .= " enemyX= ? ,";
                array_push($params, $this->enemyX);
            }
            if ($this->enemyY) {
                $sql .= " enemyY= ? ,";
                array_push($params, $this->enemyY);
            }
            if ($this->enemyZ) {
                $sql .= " enemyZ= ? ,";
                array_push($params, $this->enemyZ);
            }
            
            // Strip the last comma from the query
            $writeData = $this->pdo->prepare(substr($sql, 0, -1));
            
            $writeData->execute($params);
            
            // TODO: don't read again, jfc.
            return $this->read();
        }
    }
    
    public function read() {
        $params = [];
        $sql = " SELECT gameID, playerCharacter, enemyCharacter, interaction, side, method, playerX, playerY, playerZ, enemyX, enemyY, enemyZ "
                . " FROM overwatch.gamedata \n"
                . " WHERE 1=1 ";

        if ($this->gameID) {
            $sql .= " AND gameID= ? \n";
            array_push($params, $this->gameID);
        }
        if ($this->playerHero) {
            $sql .= " AND playerCharacter= ? \n";
            array_push($params, $this->playerHero);
        }
        if ($this->enemyHero) {
            $sql .= " AND enemyCharacter= ? \n";
            array_push($params, $this->enemyHero);
        }
        if ($this->mode) {
            $sql .= " AND interaction= ? \n";
            array_push($params, $this->mode);
        }
        if ($this->side) {
            $sql .= " AND side= ? \n";
            array_push($params, $this->side);
        }
        if ($this->method) {
            $sql .= " AND method= ? \n";
            array_push($params, $this->method);
        }
        if ($this->playerX) {
            $sql .= " AND playerX= ? \n";
            array_push($params, $this->playerX);
        }
        if ($this->playerY) {
            $sql .= " AND playerY= ? \n";
            array_push($params, $this->playerY);
        }
        if ($this->playerZ) {
            $sql .= " AND playerZ= ? \n";
            array_push($params, $this->playerZ);
        }
        if ($this->enemyX) {
            $sql .= " AND enemyX= ? \n";
            array_push($params, $this->enemyX);
        }
        if ($this->enemyY) {
            $sql .= " AND enemyY= ? \n";
            array_push($params, $this->enemyY);
        }
        if ($this->enemyZ) {
            $sql .= " AND enemyZ= ? \n";
            array_push($params, $this->enemyZ);
        }
            
        // Strip the last comma from the query
        $readData = $this->pdo->prepare($sql);

        $readData->execute($params);
        
        // Return all rows from dataset
        return $this->rows($readData);
    }
    
    public function update() {
    }
    
    public function delete() {       
        
    } 
}
?>