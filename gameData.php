<?php
include_once 'pdoHandle.php';

$servername = "localhost";
$username = "root";
$password = "monkeybrains";

$gameID =  filter_input(INPUT_POST, "gameID");
$playerX = filter_input(INPUT_POST, "playerX");
$playerY = filter_input(INPUT_POST, "playerY");
$playerZ = filter_input(INPUT_POST, "playerZ");
$enemyX = filter_input(INPUT_POST, "enemyX");
$enemyY = filter_input(INPUT_POST, "enemyY");
$enemyZ = filter_input(INPUT_POST, "enemyZ");
$mode = filter_input(INPUT_POST, "mode");
$side = filter_input(INPUT_POST, "side");
$playerHero = filter_input(INPUT_POST, "playerHero");
$enemyHero = filter_input(INPUT_POST, "enemyHero");
$method = filter_input(INPUT_POST, "method");

$con = new mysqli($servername, $username, $password);

if ($con->connect_error) {
    die("Connection failed: " . $con->connect_error);
}

$gameID = filter_input(INPUT_POST, "gameID");
echo $gameID;   
?>