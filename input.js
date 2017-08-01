/* global map_, d3, INFO, characters *** declared in map.js */

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
 *          The menu displays the two previously selected characters
 *          Other relevant factors are also available for selection. Any that rely on others, are greyed out until the requisites are fulfilled
 *          Moving focus outside of this menu turns it very transparent and allows interaction with map and elements below.
 *              ? If element is created in center of canvas, what should the workflow be to move it?
 *              
 *  3a. Once the menu has been filled well enough, the user can accept the value and hit accept. This saves it to database.
 *          Up to a defined amount, iterations of database save are kept and can be reverted. Undoing will delete elements on map
 *          Hitting cancel will delete both previously created elements. Toggleable warning for this available
 * 
 ******************************************************************************/

/* The hero select menu is a variant of a radial menu.
 * 
 * It has a center and four quadrants surrounding the center
 * Each quadrant represents a class
 * 
 * Elements are placed in their corresponding quadrant in a radial pattern
 * The center of the circle the radial pattern is translated to begin within each quadrant
 * 
 * @param {object} c : the center of the hero select. Will be subject to some limitations in practice
 */
function heroSelect(c) {
    var svg = d3.select("#heroSelect");
    
    var attack = characters.filter(function(d) {
        return d.class === "attack";
    });
    var defense = characters.filter(function(d) {
        return d.class === 'defense';
    });
    var tank = characters.filter(function(d) {
        return d.class === 'tank';
    });
    var support = characters.filter(function(d) {
        return d.class === 'support';
    });
    
    var heroClick = function() { console.log($(this).addClass("selected")); };
    var heroHover = function() { $(this).css("opacity", ".9"); };
    var heroUnHover = function() { $(this).css("opacity", ".4"); };
    
    createQuadrant(svg, 1, heroClick, heroHover, heroUnHover, attack, 30, c);
    createQuadrant(svg, 2, heroClick, heroHover, heroUnHover, defense, 30, c);
    createQuadrant(svg, 3, heroClick, heroHover, heroUnHover, support, 30, c);
    createQuadrant(svg, 4, heroClick, heroHover, heroUnHover, tank, 30, c);
}

/* Create row of a radial menu, populated with circles of desired radius.
* Class the created elements according to data[name]
*/
var createRow = function(svg, clicked, hovered, mouseOut, rowNumb, circleRadius, center, quadrant, data) {
    var circlesInRow = 2*rowNumb;

    var i,
        degrees = Math.PI/(2*circlesInRow-2),
        distance = rowNumb*circleRadius*2.2;

    for (i = 0; i < circlesInRow && i < data.length; i++) {
        svg.append("circle")
            .attr("r", circleRadius)
            .attr("transform", "translate(" + (center.x + quadrant.x*Math.cos(i*degrees)*distance) + "," + (center.y + quadrant.y*Math.sin(i*degrees)*distance) + ")")
            .attr("class", "menu " + data[i].name)
            .style("opacity", ".4")
            .attr("name", data[i].name)
            .on("mouseover", hovered)
            .on("mouseout", mouseOut)
            .on("click", clicked);
    }
};

/* Fill out an entire quadrant
* Compute the number of rows needed on the fly and partially fill the last.
* Data dependent on how many elements are created and what the result will look like
* 
* TODO: Algorithm can currently only handle 3 rows without overlapping circles.
*/
var createQuadrant = function(svg, quadNum, clicked, hovered, mouseOut, data, radius, center) {
    var quadrant = [{x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}][quadNum - 1];
    
    var numOfRows = 0;
    var elementsLeft = data.length;
    var c = {x: center.x + quadrant.x*(radius*2.5)/2, y: center.y + quadrant.y*(radius*2.5)/2};

    svg.append("circle")
            .attr("r", radius)
            .attr("transform", "translate(" + c.x + "," + c.y + ")")
            .attr("class", "menu " + data[0].name)
            .attr("name", data[0].name)
            .style("opacity", ".4")
            .on("mouseover", hovered)
            .on("mouseout", mouseOut)
            .on("click", clicked);
    elementsLeft--;
    
    data = data.slice(1);

    while(elementsLeft > 0) {
        createRow(svg, clicked, hovered, mouseOut, ++numOfRows, radius, c, quadrant, data);
        data = data.slice(2*numOfRows);
        elementsLeft = elementsLeft -  2*numOfRows;
    }
};

/* One of the important form elements is a 'method' of elimination
 * This depends on both what hero is being used, and whether it is an elimination or a death
 * 
 * Check the mode then check what hero is being used. 
 * Use this information to populate the elimination mode select dropdown. 
 * 
 * TODO: OPTIMIZATION: This is called on every change to the form, not just the relevant ones.
 * TODO: This should also be called on initialization of the list.
 *          Default values for radio buttons
 */
function elimMethodChange() {
    var mode,
        hero,
        methodList = [],
        field,
        character;
            
    // Remove any previous selections
    $('#methodSelect').empty();
            
    mode = $('input[name=mode]:checked', '#inputForm').val(); 
    if (mode === 'Death') {
        hero = $('#enemyHero').find(":selected").text();
    } 
    else { // Is an Assist or Elimination, either way it takes player data
        hero = $('#playerHero').find(":selected").text();
    }
    
    // Given the hero name, we can create the method list from the characters object
    character = characters.filter(function(d) { return d.name === hero; })[0];
    for (field in character) {
        switch (field) {
            case 'lmb':
            case 'rmb':
            case 'ability1':
            case 'ability2':
                methodList.push(character[field]);
                break;
            default:
        }
    }

    fillSelect('#methodSelect', methodList)
}

/* 
 * Initialize all html elements that pertain to input
 * 
 * Check if Sidebar is popped out the sidebar and populate it
 * 
 * @param {type} container : a d3 "g" element that will contain all future svg elements
 * @returns {undefined}
 */
function initInput(container) {
    // Check sidebar +
    
    // Populate sidebar +

    $('#inputForm').change(elimMethodChange);
    
    
    /* A user clicks on the map
     *      1. create an svg element at location
     *      2. Open a mandatory dialog box to select hero
     *      3. Populate the creation form with hero appropriate hero data
     *      4. Once both heroes have been selected open the data creation form
     */
    var clicked = function() {
        // Variables containing click information
        var mouse = d3.event,
            transform = container.attr("transform"), 
            transformX = mouse.layerX,
            transformY = mouse.layerY;

        var newObject;
        var hero;
        // When the submission form is open, no new data can be created
        if (!clicked.formOpen) {
            if (transform) {
                transform = getTransformation(transform);
                // Transform data to have 1:1 correspondence with svg
                transformX = Math.round(mouse.layerX/transform.scaleX - (transform ? transform.translateX/transform.scaleX : 0));
                transformY = Math.round(mouse.layerY/transform.scaleY - (transform ? transform.translateY/transform.scaleY : 0));
            }

            if (INFO) {
                console.log("[INFO] " + "transformX: " + transformX + " transformY: " + transformY);
            }

            /* Create a modal to force user to fill out dialog
             *      - Moving cursor off the modal will turn the modal transparent to view beneath. +
             *      - The only way to close the modal is by accepting or denying it 
             *      
             * Modal interaction options:
             *      1. If the user enters valid values, and accepts them, populate the svg
             *      2. If the user does not enter valid values and accepts, point out errors: keep modal open +
             *      3. If the user cancels the modal, do not populate the svg.
             *      
             *  Break the modal down after use
             */
            heroSelect({x: mouse.layerX, y: mouse.layerY});

            displayModal('#heroSelect');

            $('#heroSelect').find('.menu').unbind('click').click(function() {
                // A hero has been selected. Which one is it?       
                // Remove the selected status for the next selection.
                hero = $('#heroSelect').find(".selected").attr("name");
                $('#heroSelect').find(".selected").removeClass("selected");
                /* Determine what the next click will produce based on the previous shape created and validated
                 * 
                 * Each shape created will be both clickable and hoverable +
                 * 
                 * On click: 
                 *      - Re-open the modal and allow values to be changed. +
                 *      - Show the matching pair +
                 * On Hover: 
                */
                if (typeof clicked.lastClick === 'undefined' || clicked.lastClick === 'rect') {
                    // This is either the first element created, or the previous element was the enemy
                    // Either way, create a player icon.
                    clicked.lastClick = 'circle';
                    newObject = container.append("circle")
                            .attr("r", 7.5)
                            .attr("transform", "translate(" + transformX + "," + transformY + ")")
                            ;
                    // Select the player hero value in the form to come
                    $('#playerHero option[value="' + hero + '"]').prop('selected', true);
                    
                    closeModal('#heroSelect');
                    clicked.lastCircle = newObject;
                }
                /* When the rectangle is created and selected, the pair has been completed.
                 * Open the form menu to save the pair to database.
                 * 
                 * Rectangles are created on the top left corner. Transform the rectangle to appear at the center of the click.
                 */
                else if (clicked.lastClick === 'circle') {
                    clicked.lastClick = 'rect';
                    newObject = container.append("rect")    
                            .attr("height", 10)
                            .attr("width", 10)
                            .attr("transform", "translate(" + (transformX-5) + "," + (transformY-5) + ")");
                    // Select the enemy hero value in the form to come
                    $('#enemyHero option[value="' + hero + '"]').prop('selected', true);
                    
                    elimMethodChange();
                    // Opening a new modal will automatically close out of the previous modal
                    floatModal('#inputForm');

                    clicked.formOpen = true;
                    clicked.lastRect = newObject;
                }
                   
                /* Objects created have shared properties
                 *      
                 * Drag:
                 *      - On start, move to front, increase size and stroke and do the same to its sibling + 
                 */
                function dragged() {
                    d3.select(this).attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
                }
                
                if (newObject) {
                    newObject.attr("class", hero)
                            .call(d3.drag().on("drag", dragged))
                            .attr("posX", transformX)
                            .attr("posY", transformY)
                            .on('contextmenu', function() { d3.event.preventDefault(); });
                }
                // Now that the menu has been used, delete all of the created menu elements for recreation on the next click
                $('#heroSelect').empty();
            });    

            /* The way to cancel the form submission is by clicking anywhere else in the document
             * heroSelect is the svg containing the menu. It spans the whole page and is on top. Clicking it will cancel the menu.
             */
            $('#heroSelect').unbind('click').click(function(event) {
                if (event.target === $('#heroSelect')[0]) {
                    closeModal('#heroSelect');
                    // Now that the menu has been used, delete all of the created menu elements for recreation on the next click
                    $("#heroSelect").empty();
                }
            });
        }
    };

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
    
    $('#gamedata').submit(saveGameData);
    
    /* Game meta data save handler
     * 
     * Send the save request and receive a response containing the gameID of the newly created Game
     * Use this to provide the foreign key in gameDataSave
     */
    var saveGame = function(e) {
        var url = "index.php";
        var formData = $(this).serializeArray();
                        
        console.log($(this).children("input[name=player]").val());
                        
        formData.push({name: 'resource', value: 'game'});
                
        $.ajax({
            type: "POST",
            url: url,
            data: formData
        }).done(function(response) { 
            console.log(response);
            response = JSON.parse(response);
            // TODO: handle fail cases +
            if (response.gameID !== 0 && typeof response.gameID === 'number') {   
                saveGameData.lastID = response.gameID;
            } 
        });

        e.preventDefault();
    };
    
    $("#gameSave").submit(saveGame);
    
    $('#playerHero').change(function() { 
        clicked.lastCircle.attr('class', $(this).find(':selected').text());
    });
    $('#enemyHero').change(function() { 
        clicked.lastRect.attr('class', $(this).find(':selected').text());
    });
    
    container.on("click", clicked);
};

/* Create correct JSON from a form.
 * Eliminate any empty fields.
 * 
 * Code snippet from https://css-tricks.com/snippets/jquery/serialize-form-to-json/
 * @returns object
 */
$.fn.serializeObject = function(extraData = []) {
    var o = {};
    var a = this.serializeArray();
    a = a.concat(extraData);
    console.log(a);
    
    $.each(a, function(index, element) {
        if(o[element.name]) {
            // Field is already in object. 
            if (!o[element.name].push) {
                // The element is not an array yet
                o[element.name] = [o[element.name]];
            }
            // Push the value
            if (element.value) {
                o[element.name].push(element.value);
            }
        }
        else {
            if (element.value) {
                o[element.name] = element.value;
            }        
        }
    });
    
    return o;
};

/* All maps are split into quadrants
 * Based on the map image specifications and the transform coordinates from the svg, determine the individual map positions
 * 
 * TODO: Do I even need to do this?
 * 
 * @param {type} original
 * @returns {undefined}
 */
function quadrantCoords(original) {
    original.z = 1;
    return original;
}

/* Remove interactability with an element.
 * Lower opacity to provide users with feedback
 * 
 * @param {type} element
 * @returns {undefined}
 */
function fixElement(element) {
    element.on('mousedown.drag', null)
            .on('contextmenu', function() { d3.event.preventDefault(); })
            .style('opacity', '.5');
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