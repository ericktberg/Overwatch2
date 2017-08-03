/* global map_, d3, INFO, characters, ContextWindow *** declared in map.js */

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

/* Display the input view
 * 
 * 
 * @returns {undefined}
 */
function inputView() {
    ContextWindow.open();
    
    $('.context-input').addClass('is-active');
    
    
    
}

function CreateGame(e) {
    e.preventDefault();
    
    console.log("Game Created");
    var svg = d3.select("#Viz > svg");
    
    drawMap(svg, maps_d[map_]);
}

function LoadGame() {
    console.log("Game Loaded");
    
    var svg = d3.select("#Viz > svg");
    
    drawMap(svg, maps_d[map_]);
}