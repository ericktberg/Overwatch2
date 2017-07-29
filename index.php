<?php
/* RESTful PHP server disambiguation
 * 
 * Gather the http request data and serve the request from the relevant files
 * Handle the request polymorphically
 * 
 */
include_once 'game.php';
include_once 'gamedata.php';

$method = filter_input(INPUT_SERVER, 'REQUEST_METHOD');

/* Grab the http request information */
$resource = filter_input(INPUT_POST, 'resource');

/* Check media type, send error if not json */

/* Choose the resource being handled 
 * Regardless of resource, all handles implement CRUD principles
 */
$PDO;
switch ($resource) {
    case 'game':
        $PDO = new Game($method);
        break;
    case 'gamedata':
        $PDO = new GameData($method);
        break;
    default:
        // $PDO = new PdoHandle;
        break;
}

/* Select the method to run based on httpRequest param */
$response;
switch ($method) {
    case 'POST':
        $response = $PDO->create();
        break;
    case 'GET':
        $response = $PDO->read();
        break;
    case 'PUT':
        $PDO->update();
        break;
    case 'DELETE':
        $PDO->delete();
        break;
    default:
        break;
}

echo json_encode($response, JSON_NUMERIC_CHECK);
?>