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
$sql = " SELECT gd.playerX, gd.playerY, gd.playerZ, gd.enemyX, gd.enemyY, gd.enemyZ "
        . " FROM overwatch.player p "
        . " INNER JOIN overwatch.game g ON g.player = p.playerName "
        . " INNER JOIN overwatch.gamedata gd ON gd.gameID = g.gameID; ";

$sth = mysqli_query($con, $sql);
$rows = array();
while($r = mysqli_fetch_assoc($sth)) {
    $rows[] = $r;
}
echo json_encode($rows, JSON_NUMERIC_CHECK);
?>

