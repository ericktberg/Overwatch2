/* global map_, d3, INFO *** declared in map.js */

/*******************************************************************************
 * 
 * Input.js controls the interactive map that allows users to input data
 * It interfaces with a php file to save data to a database.
 * 
 * Input occurs in several stages
 *      1. Find battletag associated with player +
 *          * does it exist? if it doesn't, create an entry +
 *          * Is this player associated with a User? or is this a pro player? +
 *              Eventually only pro player data will be publically available
 *              We will want to quality control this data, 
 *              TODO: find a way to quality control the data +
 *              
 *      2. Collect information about the game being played +
 *          * Team elos, player elo, Win/Loss, Map, Video data +
 *          * Video data can be from disk, url, or twitch +
 *          * Has this video been used already? Avoid duplicates +
 *          * Add a video player to the interface ?
 *          
 *      3. Easy to use interface to collect elimination and death information +
 *          * Place pins for a pair (player/enemy) locations, player first with left click +
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
    
    /* A user clicks on the map
     *      1. create an svg element at location
     *      2. Open a mandatory dialog box to select hero
     */
    var clicked = function() {
        var mouse = d3.event,
            transform = container.attr("transform"), 
            transformX = mouse.layerX,
            transformY = mouse.layerY,
            locationX,
            locationY;
        
        var lastCircle,
            lastRect;
    
        var hero;
        
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
         */
        $('#modals').css({display: 'block'});
        $('#inputModal').css({display: 'block'});
        
        $('#inputModal').find('.menu').unbind('click').click(function() {
            $('#modals').css({display: 'none'});
            $('#inputModal').css({display: 'none'});
            
            hero = $('#heroSelect').find(".selected").attr("name");
            console.log(hero);
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
                clicked.lastClick = 'circle';
                container.append("circle")
                        .attr("r", 7.5)
                        .attr("transform", "translate(" + transformX + "," + transformY + ")")
                        .attr("class", hero)
                        .on("contextmenu", function () {
                            d3.event.preventDefault();                            
                });
            }
            else if (clicked.lastClick === 'circle') {
                clicked.lastClick = 'rect';
                container.append("rect")    
                        .attr("height", function(d) { return 10; })
                        .attr("width", function(d) { return 10; })
                        .attr("class", hero)
                        .attr("transform", "translate(" + (transformX-5) + "," + (transformY-5) + ")")
                        .on("contextmenu", function () {
                            d3.event.preventDefault();                            
                });   
            }
        });    
        
        $('#inputModal').find('.cancel').unbind('click').click(function() {
            $('#modals').css({display: 'none'});
            $('#inputModal').css({display: 'none'});
        });
    };
    
    container.on("click", clicked);
};

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