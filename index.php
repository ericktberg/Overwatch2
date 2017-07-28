<?php
/* RESTful PHP server disambiguation
 * 
 * Gather the http request data and serve the request from the relevant files
 * Handle the request polymorphically
 * 
 */
include_once 'game.php';

$method = filter_input(INPUT_SERVER, 'REQUEST_METHOD');

/* Grab the http request information */
$post = file_get_contents('php://input');
$json = json_decode($post, true);

$resource = $json['resource'];
$fields = $json['fields'];

/* Check media type, send error if not json */

/* Choose the resource being handled 
 * Regardless of resource, all handles implement CRUD principles
 */
$PDO;
switch ($resource) {
    case 'game':
        $PDO = new Game;
        break;
    case 'gamedata':
        $PDO = new GameDataHandle;
        break;
    default:
        // $PDO = new PdoHandle;
        break;
}

/* Select the method to run based on httpRequest param */
$response;
switch ($method) {
    case 'POST':
        $response = $PDO->create($resource, $fields);
        break;
    case 'GET':
        $response = $PDO->read($resource, $fields);
        break;
    case 'PUT':
        $PDO->update($resource, $fields);
        break;
    case 'DELETE':
        $PDO->delete($resource, $fields);
        break;
    default:
        break;
}

echo json_encode($response, JSON_NUMERIC_CHECK);
?>