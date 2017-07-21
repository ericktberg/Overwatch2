<?php
/* PHP file that handles queries
 * Possibly split into two at some point (or use functions?) to handle graph and map differences
 * Takes parameters from UI of website and queries database, returning json structured
 *
 */


$servername = "localhost";
$username = "root";
$password = "monkeybrains";

$con = new mysqli($servername, $username, $password);

if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}
/* Save player information 
 * 
 *      - If player exists, check to update their max SR +
 *      - else create player +
 * 
 *  TODO: prepared statement
 */
$playerName = filter_input(INPUT_POST, "player");

$sql = " INSERT IGNORE INTO overwatch.player\n"
        . " SET playerName='" . $playerName . "',\n"
        . " pro=0;\n";

if (mysqli_query($con, $sql)) {
    echo "[success]:\n" . $sql . "\n";
} else {
    echo "[Error]: " . $sql . "<br>" . mysqli_error($con) . "\n";
}

/* Save game information 
 *
 *      - Check for game information and deliver message if it exists +
 *      - Create the game otherwise +
 *      - Return the gameID ?
 * 
 *  TODO: prepared statement
 *  TODO: Auto-increment does not run on failure, ignore is likely the cause
 */
$date = filter_input(INPUT_POST, "date");
$playerSR = filter_input(INPUT_POST, "playerSR");
$teamSR = filter_input(INPUT_POST, "teamSR");
$enemySR = filter_input(INPUT_POST, "enemySR");

$sql = " INSERT IGNORE INTO overwatch.game\n"
        . " SET player='" . $playerName . "',\n"
        . " date=STR_TO_DATE('" . $date . "', '%m/%d/%Y'),\n"
        . " playerElo='" . $playerSR . "',\n"
        . " teamElo='" . $teamSR . "',\n"
        . " enemyTeamElo='" . $enemySR . "';\n";

if (mysqli_query($con, $sql)) {
    echo "[success]:\n" . $sql . "\n";
} else {
    echo "[Error]: " . $sql . "<br>" . mysqli_error($con) . "\n";
}

?>