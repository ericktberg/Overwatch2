/* global d3, OVERWATCH */

/*******************************************************************************
 * 
 * Input.js controls the interactive map that allows users to input data
 * It interfaces with a php file to save data to a database.
 * 
 * Input occurs in several stages
 *      1. Find battletag associated with player +
 *          * does it exist? if it doesn't, create an entry 
 *          * Is this player associated with a User? or is this a pro player? +
 *              Eventually only pro player data will be publically available
 *              We will want to quality control this data, 
 *              TODO: find a way to quality control the data +
 *              
 *      2. Collect information about the game being played +
 *          * Team elos, player elo, Win/Loss, Map, Video data
 *          * Video data can be from disk, url, or twitch +
 *          * Has this video been used already? Avoid duplicates +
 *          * Add a video player to the interface ?
 *          
 *      3. Easy to use interface to collect elimination and death information +
 *          * Place pins for a pair (player/enemy) locations, player first with left click
 *          * Move previously placed pin with right click +
 *          * Undo last action with ctrl-z +
 *      3a. Information about pins prompted on ctrl+lmb + 
 *          * Character (required) (remembered) +
 *          * Death/Elimination/Assist (required) +
 *          * Weapon/ability used +
 *          * Game status info (Attack/Defense) (Time/Overtime?) (Payload position) (Checkpoints/A/B) (KOTH map, requires map swap) (Required) (Remembered) +
 *          
 * Display of previously input data is similar to point type display
 * 
 * !!! There is a lot of nested 'click' functionality in this system. Beware. Keep scope in mind. !!!
 * 
 * Usage steps:
 * 
 *  0. Fill out player and game data, send a request, and have it complete/form is filled properly
 * 
 *  1.  Click on canvas. Character selection for player comes up (radial menu centered on click)
 *          Selecting a character closes the menu and colors the new element created at click location
 *          Clicking outside the menu or hitting esc will cancel the creation of the element
 *      
 *  2a. Click on canvas again. Character selection for enemy comes up, identical to player except maybe coloration and title
 *  
 *  2b. Right clicking the created elements allows user to reselect the character
 *          ? + clicking the element allows user to drag the element somewhere else on the canvas
 *          Holding ? in addition to the rest will allow the user to scrub the canvas
 *          
 *  3. Once the second element is created, a menu appears in the center of the screen.
 *          The menu displays the two previously selected OVERWATCH.heroes.
 *          Other relevant factors are also available for selection. Any that rely on others, are greyed out until the requisites are fulfilled
 *          Moving focus outside of this menu turns it very transparent and allows interaction with map and elements below.
 *              ? If element is created in center of canvas, what should the workflow be to move it?
 *              
 *  3a. Once the menu has been filled well enough, the user can accept the value and hit accept. This saves it to database.
 *          Up to a defined amount, iterations of database save are kept and can be reverted. Undoing will delete elements on map
 *          Hitting cancel will delete both previously created elements. Toggleable warning for this available
 * 
 ******************************************************************************/


OVERWATCH.input = (function() {
    var container = null;
    
    var lastCircle = null,
        lastRect = null;
        
    var lastClick = null;
    
    var heroSelect = null;
    
    var transformX = null, 
        transformY = null;
        
    var currentGameID = null;
        
    $(document).ready(function () {
        // Populate the hero selection lists with heroes
        $.each(OVERWATCH.heroes.list, function(i, val) {
            $("#CreateGameDataMenu .populate.hero").append($('<option>', {
                value: val.name,
                text: val.name
            }));
        });
        
        $("#CreateGameDataMenu .populate").change(methodChange);
        
        
        // Create game submission will create a game, load it into view, and close menus associated with game selection
        $("#CreateGameMenu > form").submit(CreateGame);
        $("#CreateGameDataMenu form").submit(CreateGameData);
        $("#SelectGameMenu form").submit(LoadGames);
        
        // Cancel button removes the last created data
        $("#CreateGameDataMenu .cancel").click(function() {
           if (lastCircle) {
               lastCircle.remove();
           } 
           if (lastRect) {
               lastRect.remove();
           }
        });
        
        // The buttons for selecting a game will load it into menu
        $(".select-game").click(getGame);
        
        // Initialize the hero select menu
        heroSelect = OVERWATCH.radialQuadrantMenu.create;
        heroSelect.init(d3.select('#HeroSelect > svg'), 
                        OVERWATCH.heroes.attack, 
                        OVERWATCH.heroes.defense, 
                        OVERWATCH.heroes.support, 
                        OVERWATCH.heroes.tank);
    });
    
    /* Cleanup the input function. 
     *  1. Reset any form parameters +
     *  2. Empty the svg we used
     * 
     * @returns {undefined}
     */
    function cleanup() {
        console.log("Cleaning input");
        $("#MainViz").empty();
    }
    
   /* Populate the method dropdown with new data based on data already in the form
    * 
    * @returns {undefined}
    */
    function methodChange() {
            // Clear previous options
            $("#CreateGameDataMenu .populated.method").empty();
            
            // Get value of interaction type (mode)
            var mode = $("input[name=mode]:checked", '#CreateGameDataMenu form').val();
            // Get hero name based on value of mode.
            var selector = (mode === 'Death' ? 'enemyHero' : 'playerHero');
            var name =  $("#CreateGameDataMenu select[name=" + selector + "]")
                    .find(":selected").text();
            
            // Grab the methods array
            // TODO: factor this out to OVERWATCH.heroes
            var methods = ['Melee'];
            OVERWATCH.heroes.list.map(function(hero) {
                if (hero.name === name) {
                    var test = ['lmb', 'rmb', 'ability1', 'ability2', 'ult'];
                    
                    test.map(function(val) {
                        if (hero[val]) {
                            methods.push(hero[val]);
                        }
                    });
                }
            });
            
            // Populate the select with methods options
            $.each(methods, function(i, val) {
                $("#CreateGameDataMenu .populated.method").append($('<option>', {
                    value: val,
                    text: val
                }));
            });
        }
    
    function createPlayer(hero, x, y) {
        return container.append("circle")
                .attr("r", 7.5)
                .attr("transform", "translate(" + x + "," + y + ")")
                .attr("class", hero)
                .on("contextmenu", function() { d3.event.preventDefault(); });  ;
    }
    
    function createEnemy(hero, x, y) {
        return container.append("rect")    
                .attr("height", 10)
                .attr("width", 10)
                .attr("transform", "translate(" + (x-5) + "," + (y-5) + ")")
                .attr("class", hero)
                .on("contextmenu", function() { d3.event.preventDefault(); });;
    }
    
    /* Determine what the next click will produce based on the previous shape created and validated
     * 
     * @param {type} transformX
     * @param {type} transformY
     * @returns {undefined}
     */
    function createSprite(transformX, transformY, hero) {
        var newObject = null;
         
        if (lastClick === null || lastClick === 'rect') {
            // This is either the first element created, or the previous element was the enemy
            // Either way, create a player icon.
            lastClick = 'circle';
            newObject = createPlayer(hero, transformX, transformY);
            lastCircle = newObject;
            // Assign the player hero in form
            console.log("Created Circle");
        }
        else if (lastClick === 'circle') {
            /* When the rectangle is created and selected, the pair has been completed.
            * Open the form menu to save the pair to database.
            * 
            * Rectangles are created on the top left corner. Transform the rectangle to appear at the center of the click.
            */
            lastClick = 'rect';
            newObject = createEnemy(hero, transformX, transformY);
            lastRect = newObject;
            // Assign the enemy hero in form
            console.log("Created Rectangle");
        }
        
        /* On start, move to front, increase size and stroke and do the same to its sibling + 
         */
        function dragged() {
           d3.select(this).attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
        }
        newObject.call(d3.drag().on("drag", dragged));
        
        return newObject;
    }
    
    /* The driver for interaction. Once the game has been created or loaded, this will be assigned to container
     * 
     *      1. Clicking on the map creates a sprite with a hero selection option that pops up
     *      2. Creating two sprites (a pair) brings up a data creation form
     *      
     *  Sprites can be interacted with
     * 
     */
    function clicked() {
        var mouse = d3.event,
            transform = container.attr("transform");
        transformX = mouse.layerX;
        transformY = mouse.layerY;
    
        console.log("Container clicked");
        // If the data creation menu is open, that means there is unresolved data at the moment 
        // Do not create more
        if (!$("#CreateGameDataMenu").hasClass('is-open')) {
            if (transform) {
                transform = getTransformation(transform);
                // Transform data to have 1:1 correspondence with svg
                transformX = Math.round(mouse.layerX/transform.scaleX - (transform ? transform.translateX/transform.scaleX : 0));
                transformY = Math.round(mouse.layerY/transform.scaleY - (transform ? transform.translateY/transform.scaleY : 0));
            }

            heroSelect.moveTo(transformX, transformY);
            OVERWATCH.modal.open('HeroSelect');

            $('#HeroSelect .select-item').unbind("click").click(function() {
                createSprite(transformX, transformY, $(this).attr("name"));
                
                // Open up the gameDataCreation menu if the click created a rectangle.
                if (lastClick === 'rect') {
                    OVERWATCH.index.ContextWindow.open('left');
                    $("#CreateGameDataMenu").addClass('is-open');
                    
                    // Set enemy hero
                    // TODO: these lastClicks are already referenced somewhere else. It might be possible to aggregate
                    $("#CreateGameDataMenu select[name=enemyHero]").val($(this).attr("name"));
                }
                else if (lastClick === 'circle') {
                    $("#CreateGameDataMenu select[name=playerHero]").val($(this).attr("name"));
                }
                methodChange();
            });
        }
    }
    
    /* Remove any existing svg elements and draw
     * 
     * @returns {undefined}
     */
    function drawViz() {
        $("#MainViz").empty();
        var svg = d3.select("#MainViz");
        container = OVERWATCH.maps.draw(svg);
        container.on("click", clicked);
    }
    
    /* Creating a game takes data from the form containing the submitted button
     * It will save to the "game" object
     * 
     * If the game saves properly, create the input interface with corresponding parameters
     * 
     * @param {type} e
     * @returns {undefined}
     */
    function CreateGame(e) {
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
        }).done(function(response) {
            // Check for success +
            console.log(JSON.parse(response)[0]);
            response = JSON.parse(response)[0];
            var map = response['map'];
            currentGameID = response['gameID'];
            if (map) {
                // Set params
                OVERWATCH.maps.setMap(map);

                // Initialize the interface
                drawViz();

                OVERWATCH.index.CreateGameMenu.close();
                OVERWATCH.index.ContextWindow.close('left');
            }         
        });
    }

    /* Loading a game is essentially like Creating a game but without the creation step.
     * The buttons will have data associated with them that has been established from the database
     * Take this data and create an interface from it.
     * 
     * Calls to get the data from this game will be necessary to populate from previous uses.
     * 
     * @returns {undefined}
     */
    function getGame() {        
        console.log($(this).attr('name') + " Loaded");
        
        currentGameID = $(this).attr('data-gameid');
        OVERWATCH.maps.setMap($(this).attr('name'));
        
        var svg = d3.select("#MainViz");
        
        LoadGameData();

        drawViz();
    }
    
    /* Load all games that fit into the current filter into the selection menu
     * Remove the previous selection
     * 
     * TODO: Do I need to go to the database for every filter?
     * 
     * @param {type} e
     * @returns {undefined}
     */
    function LoadGames(e) {
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
                $.each(JSON.parse(response), function(i, val) {
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
                        button.click(getGame);
                    }
                    
                });
            }
        });
    }
    
    function LoadGameData() {
        var url = "php/index.php";
        
        $.ajax({
            type: 'GET',
            url: url,
            data: [
                {'name': 'resource', 'value': 'gamedata'},
                {'name': 'gameID', 'value': currentGameID}
            ]
        }).done(function(response) {
            var data = JSON.parse(response);
            
            $.each(data, function(i, val) {
                var player = createPlayer(val.playerCharacter, val.playerX, val.playerY);
                var enemy = createEnemy(val.enemyCharacter, val.enemyX, val.enemyY);
                
                var over = function() {
                    enemy.attr("width", 15).attr("height", 15);
                    player.attr("r", 10); 
                };
                
                var out = function() {
                    enemy.attr("width", 10).attr("height", 10);
                    player.attr("r", 7.5);
                };
                
                enemy.on("mouseover", over)
                        .on("mouseout", out);
                
                player.on("mouseover", over)
                        .on("mouseout", out);
                
                
            });
        });            
    }
    
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
    function CreateGameData(e) {
        // Get positional data from created elements
        // TODO: check if they exist
        var playerPos = getTransformation(lastCircle.attr('transform')),
            enemyPos = getTransformation(lastRect.attr('transform'));
        
        console.log("Creating game data");
        e.preventDefault();
             
        // Set data up for transfer
        positionData = [{name: 'gameID', value: currentGameID},
                            {name: 'playerX', value: playerPos.translateX},
                            {name: 'playerY', value: playerPos.translateY},
                            {name: 'playerZ', value: 1},
                            {name: 'enemyX', value: enemyPos.translateX},
                            {name: 'enemyY', value: enemyPos.translateY},
                            {name: 'enemyZ', value: 1}];
        var formData = $(this).serializeArray().concat(positionData);
        formData.push({'name': 'resource', 'value': 'gamedata'});
        
        // Make http request
        var url = "php/index.php";
        $.ajax({
            type: "POST",
            url: url,
            data: formData
        }).done(function(response) {
            console.log(response);
            // Check for success and handle errors
            
            // Close the menu for continued editing
            OVERWATCH.index.CreateGameDataMenu.close();
        });
        
    }
    
    
    /* http://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4 
     * 
     * Take a d3 transform and return a legible javascript object
     * Copy and pasted from the stackoverflow
     */
    function getTransformation(transform) {
        // Create a dummy g for calculation purposes only. This will never
        // be appended to the DOM and will be discarded once this function 
        // returns.
        var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Set the transform attribute to the provided string value.
        g.setAttributeNS(null, "transform", transform);

        // consolidate the SVGTransformList containing all transformations
        // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
        // its SVGMatrix. 
        var matrix = g.transform.baseVal.consolidate().matrix;

        // Below calculations are taken and adapted from the private function
        // transform/decompose.js of D3's module d3-interpolate.
        var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
        // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
        var scaleX, scaleY, skewX;
        if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
        if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
        if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
        if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
        return {
            translateX: e,
            translateY: f,
            rotate: Math.atan2(b, a) * 180 / Math.PI,
            skewX: Math.atan(skewX) * 180 / Math.PI,
            scaleX: scaleX,
            scaleY: scaleY
        };
    }
    
    // Public functions for 
    return {
        /* Display the input view
        */
        view: function() {
            OVERWATCH.index.ContextWindow.open('left');
    
            $('.context-input').addClass('is-active');
            
            console.log(cleanup);
            return {cleanup: cleanup};
        }
    }
})();





