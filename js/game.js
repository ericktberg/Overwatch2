/* global OVERWATCH */

OVERWATCH.game = (function () {
    var currentGameID = null;
    
    /*
     * 
     * @param {type} data
     * @param {function} DataToMap - Function that determines how to handle data once it has been loaded
     * @returns {undefined}
     */
    var fillGameSelect = function(data) {
        $.each(data, function(i, val) {
            if (val.map) {
                // Add the button container
                var li = $('<li></li>')
                        .addClass('select-item')
                        .appendTo('#SelectGameMenu .select-items');
                // The button contains data that will be used on click
                var button = $('<button></button')
                        .addClass('select-game')
                        .addClass(val.map)
                        .attr('data-gameid', val.gameID)
                        .attr('name', val.map)
                        .appendTo(li);
                // Button contents will change on hover to give more information

                // Get the game into canvas on click
                button.click(function() {
                    console.log($(this).attr('name') + " Loaded");
                    OVERWATCH.maps.setMap($(this).attr('name'));
                    
                    currentGameID = $(this).attr('data-gameid');
                    LoadGameData(OVERWATCH.state.loadGame())();
                });
            }
        });
    };
    
    function LoadGameData(DataToMap) {
        return function() {
            var url = "php/index.php";

            $.ajax({
                type: 'GET',
                url: url,
                data: [
                    {'name': 'resource', 'value': 'gamedata'},
                    {'name': 'gameID', 'value': currentGameID}
                ]
            }).done(function(response) {
                DataToMap(JSON.parse(response));
            });            
        }
    }
    
    return {
        'setGameID': function(gameID) {
            currentGameID = gameID;
        },
        
        /* Creating a game takes data from the form containing the submitted button
        * It will save to the "game" object
        * 
        * If the game saves properly, create the input interface with corresponding parameters
        * 
        * @param {type} e
        * @returns {undefined}
        */
        'CreateGame': function(handler) {
            
            return function(e) {
                e.preventDefault();

                var url = "php/index.php";
                var formData = $(this).serializeArray();

                console.log("Creating Game");

                formData.push({name: 'player', value: OVERWATCH.user.get()});
                formData.push({name: 'resource', value: 'game'});

                $.ajax({
                    type: "POST",
                    url: url,
                    data: formData
                }).done(handler);
            };  
        },

       
        /* Load all games that fit into the current filter into the selection menu
         * Remove the previous selection
         * 
         * TODO: Do I need to go to the database for every filter?
         * 
         * @param {type} e
         * @returns {undefined}
         */
        LoadGames: function(DataToMap) {
            return function(e) {
                e.preventDefault();


                var url = "php/index.php";
                var formData = $(this).serializeArray();

                formData.push({name: 'player', value: OVERWATCH.user.get()});
                formData.push({name: 'resource', value: 'game'});

                console.log(formData);

                $.ajax({
                    type: 'GET',
                    url: url,
                    data: formData
                }).done(function(response) {
                    if(response) {
                        console.log(response);
                        // Clear out previously loaded games
                        // Be careful not to delete the create game button
                         $("#SelectGameMenu .select-item:not(.contextual").remove();

                        // Create a button inside a list element that contains game information
                        fillGameSelect(JSON.parse(response), DataToMap);
                    }
                });
            }
        },
        
        /* Submit the input form for the pair
        * 
        *  1. Check for requirements
        *  2. Gather any extra data from the map (e.g. transform data)
        *  3. Send ajax to php file
        *  4. Lock down the data that we just submitted
        *  
        *  
        *  gameID is a foreign key in the schema for this table
        *  
        */
        CreateGameData: function(playerPos, enemyPos, handler) {
            
            return function(e) {
                console.log("Creating game data");
                e.preventDefault();

                // Set data up for transfer
                var positionData = [{name: 'gameID', value: currentGameID},
                                    {name: 'playerX', value: playerPos().translateX},
                                    {name: 'playerY', value: playerPos().translateY},
                                    {name: 'playerZ', value: 1},
                                    {name: 'enemyX', value: enemyPos().translateX},
                                    {name: 'enemyY', value: enemyPos().translateY},
                                    {name: 'enemyZ', value: 1}];
                var formData = $(this).serializeArray().concat(positionData);
                formData.push({'name': 'resource', 'value': 'gamedata'});

                // Make http request
                var url = "php/index.php";
                $.ajax({
                    type: "POST",
                    url: url,
                    data: formData
                }).done(handler);
            };
        },
        
        



       };
})();