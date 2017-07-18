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
    
    /* When a user clicks on the map, create an svg element at location
     * 
     * @returns {undefined}
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
        
        if (transform) {
            transform = getTransformation(transform);
            // Transform data to have 1:1 correspondence with svg
            transformX = Math.round(mouse.layerX/transform.scaleX - (transform ? transform.translateX/transform.scaleX : 0));
            transformY = Math.round(mouse.layerY/transform.scaleY - (transform ? transform.translateY/transform.scaleY : 0));
        }
        
        if (INFO) {
            console.log("[INFO] " + "transformX: " + transformX + " transformY: " + transformY);
        }
        
        // Create a cirlce or Rectangle depending on the current state of the pair
        container.append("circle")
                .attr("r", 7.5)
                .attr("transform", "translate(" + transformX + "," + transformY + ")");
        
        container.append("rect")
                .attr("height", function(d) { return 10; })
                .attr("width", function(d) { return 10; })
                .attr("transform", "translate(" + (transformX-5) + "," + (transformY-5) + ")");
    };
    
    container.on("click", clicked);
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