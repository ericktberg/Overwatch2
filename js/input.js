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
        
    $(document).ready(function () {
        // Create game submission will create a game, load it into view, and close menus associated with game selection
        $("#CreateGameMenu > form").submit(CreateGame);
        $("#SelectGameMenu form").submit(LoadGames);
        
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
            newObject = container.append("circle")
                    .attr("r", 7.5)
                    .attr("transform", "translate(" + transformX + "," + transformY + ")");
            
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
            newObject = container.append("rect")    
                    .attr("height", 10)
                    .attr("width", 10)
                    .attr("transform", "translate(" + (transformX-5) + "," + (transformY-5) + ")");
            
            // Assign the enemy hero in form
            console.log("Created Rectangle");
        }
        
        /* On start, move to front, increase size and stroke and do the same to its sibling + 
         */
        function dragged() {
           d3.select(this).attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
        }
        /* Assign the shared properties of the objects created
         * 
         */
        newObject.call(d3.drag().on("drag", dragged))
                .attr("class", hero)
                .on("contextmenu", function() { d3.event.preventDefault(); });
        
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
                }
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
            console.log(JSON.parse(response));
            
            var map = JSON.parse(response)[0]['map'];
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
        OVERWATCH.maps.setMap($(this).attr('name'));
        
        var svg = d3.select("#MainViz");

        drawViz();
    }
    
    /* Load all games that fit into the current filter into the selection menu
     * Remove any extra 
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
        
    }
    
    function CreateGameData() {
        
    }
    
    
    /* http://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4 
     * 
     * Take a d3 transform and return a legible javascript object
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





    /* Submit the input form for the pair
     * 
     *  1. Check for requirements
     *  2. Gather any extra data from the map (e.g. transform data)
     *  3. Send ajax to php file
     *  4. Fix the data editing capabilities
     *  
     *  The saveGame functions are defined as expressions
     *  This is to allow the lastID to be passed from one handler to the other.
     *  the returned gameID from the php file saveGame.php is required for saveGameData
     *  
     *  gameID is a foreign key in the schema for this table
     *  
     *  Also, 
     */
    var saveGameData = function (e) {
        console.log(saveGameData.lastID);
        if (saveGameData.lastID) {
            var url = "index.php";
            var playerPos,
                enemyPos;
            var positionData;
            
            
            
            playerPos = quadrantCoords({x: clicked.lastCircle.attr('posX'), y: clicked.lastCircle.attr('posY')});
            enemyPos = quadrantCoords({x: clicked.lastRect.attr('posX'), y: clicked.lastRect.attr('posY')});

            positionData = [{name: 'gameID', value: saveGameData.lastID},
                            {name: 'playerX', value: playerPos.x},
                            {name: 'playerY', value: playerPos.y},
                            {name: 'playerZ', value: playerPos.z},
                            {name: 'enemyX', value: enemyPos.x},
                            {name: 'enemyY', value: enemyPos.y},
                            {name: 'enemyZ', value: enemyPos.z}];            
            var formData = $(this).serializeArray().concat(positionData);
            formData.push({name: 'resource', value: 'gamedata'});
            
            
            $.ajax({
                type: "POST",
                url: url,
                data: formData
            }).done(function(response) { 
                console.log(response); 
            });

            // Once the form is submitted, the values are set in stone. 
            // "Undoing" will delete the two previous, not allow modification
            fixElement(clicked.lastCircle);
            fixElement(clicked.lastRect);

            // Close the form
            closeModal('#inputForm');
            clicked.formOpen = false;            
        }
        e.preventDefault(); 
    };