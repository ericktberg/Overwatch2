<?php
/* PHP file that handles queries
 * Possibly split into two at some point (or use functions?) to handle graph and map differences
 * Takes parameters from UI of website and queries database, returning json structured
 *
 */

$player = filter_input(INPUT_POST, "player");

$servername = "localhost";
$username = "root";
$password = "monkeybrains";


/* Save player information */


/* Save game information */

echo $player;
?>