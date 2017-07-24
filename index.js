/* 
 * index.js defines sitewide behaviors
 * 
 * Facts:
 *     - When the window loads, default content is displayed
 *     - The top bar is managed by this javascript file
 *     - Content is managed by specific javascript files
 *     - Swapping content types is done here.
 */

/* global d3 */

var INFO = false;


/*  When window loads, display default content
 *  Set behaviors and fill-in data for DOM elements
 *      TODO: DOM elements that are not being referenced can be filled in when they become relevant
 * 
 * @type type
 */
$(document).ready(function () {
    drawEnvironment(d3.select("#vizContent"));
    
    /**************** TAG: not a global element **************/
    $("#datepicker").datepicker();
    
    /**************** TAG: not a global element **************/
    fillSelect("#playerHero", characters.map(function(d) { return d.name; }));
    fillSelect("#enemyHero", characters.map(function(d) { return d.name; }));
    
    /**************** TAG: not a global element **************/
    $("#gameSave").submit(function(e) {
        var url = "saveGame.php";
        
        $.ajax({
            type: "POST",
            url: url,
            data: $(this).serialize(),
        }).done(function(response) { 
            console.log(response); 
        });
        
        e.preventDefault();
    });
});



// Maps button
// On hover, display 
function mapButton() {
    
}

// Graph button
function graphButton() {
    
}

/* Fill a select element with options with value and text given by a dataset.
 * 
 * @param {type} id : The id of the select in jquery format. 
 * @param {type} data : An array of values
 */
function fillSelect(id, data) {
    var list = $(id)[0];
    
    $.each(data, function(i, val) {
        list.options[list.options.length] = new Option(val, val);
    });
}

/* Display an arbitrary modal. 
 * 
 * All other modals are closed out
 * Then the appropriate modal and the modals object is displayed
 * 
 * To animate a fade out, first display, then animate opacity
 */
function displayModal(id) {
    $('#modals').css({display: 'block', 'pointer-events': 'auto', 'background-color': 'rgba(0,0,0,.3)'});
    $('#modals').children().css({display: 'none'});
    $(id).css({display: 'block'});
}

/* A floated modal allows interaction with the background on 
 * 
 * When hovering over the modal, display at full opacity +
 * When hovering away from modal display the background and reduce opacity of modal +
 * 
 * This needs an obvious creation animation, otherwise it can be hard to see when the cursor isn't hovered over it automatically +
 * 
 * @param {type} id
 * @returns {undefined}
 */
function floatModal(id) {
    // The modal background of transparent gray is only displayed when hovering over the modal
    // This gives feedback to user that the background is interactable.
    $('#modals').css({display: 'block', 'pointer-events': 'none', 'background-color': 'rgba(0,0,0,0)'}).unbind('hover').hover(function () {
        $(this).css({'background-color': 'rgba(0,0,0,.3)'});
    }, function () {
        $(this).css({'background-color': 'rgba(0,0,0,0)'});
    });
    $('#modals').children().css({display: 'none'});
    // Reduce opacity of modal itself when it is being hovered over
    $(id).css({display: 'block', 'pointer-events': 'auto'}).unbind('hover').hover(function () {
        $(this).css({opacity: .9});
    }, function () {
        $(this).css({opacity: .3});
    });
}

/* Close a modal.
 * 
 * To animate fade out, animate opacity then stop displaying
 */
function closeModal(id) {
    $('#modals').css({display: 'none'});
    $(id).css({display: 'none'});
}
// A sidebar pops out for use in some visualizations.
// TopBar buttons are effected by sidebar positioning
function toggleSideBar() {
    $('#mapsButton').toggleClass("open");
    $('#graphsButton').toggleClass("open");
    $('#sideBar').toggleClass("open");
}

var characters = [
	{name: "Genji", class: "attack", lmb: "Shurikens", rmb: "Shuriken Fan", ability1: "Dash", ability2: "Deflect", ult: "Dragonblade"},
	{name: "McCree", class: "attack", lmb: "Peacekeeper", rmb: "Fan the Hammer",  ability1: "Flashbang", ult: "Deadeye"},
	{name: "Pharah", class: "attack", lmb: "Rocket", ability1: "Concussion Blast", ult: "Rocket Barrage"},
	{name: "Reaper", class: "attack", lmb: "Hellfire Shotguns", ult: "Death Blossom"},
	{name: "Soldier", class: "attack", lmb: "COD Gun", ability1: "Helix Rocket", ult: "Tactical Visor"},
	{name: "Sombra", class: "attack", lmb: "Machine Pistol", ability1: "Hack", ult: "EMP"},
	{name: "Tracer", class: "attack", lmb: "Pulse Pistols", ult: "Pulse Bomb"},
	{name: "Bastion", class: "defense", lmb: "Configuration: Recon", rmb: "Configuration: Sentry", ult: "Configuration: Tank"},
	{name: "Hanzo", class: "defense", lmb: "Tree trunks", ability1: "Scatter Arrow", ability2: "Sonic Arrow", ult: "Dragonstrike"},
	{name: "Junkrat", class: "defense", lmb: "Grenade Launcher", ability1: "Concussion Mine", ability2: "Trap", ult: "Tire"},
	{name: "Mei", class: "defense", lmb: "Freeze", rmb: "Icicle", ult: "Blizzard"},
	{name: "Torbjorn", class: "defense", lmb: "Rivet Gun", rmb: "Shotgun", ability1: "Turret", ult: "Molten Core"},
	{name: "Widowmaker", class: "defense", lmb: "SMG", rmb: "Scope", ability1: "Venom Mine", ult: "Walls"},
	{name: "D.va", class: "tank", lmb: "Popcorn gun", ability1: "Rocket Booster", ult: "Self-Destruct"},
	{name: "Orisa", class: "tank", lmb: "Fusion Driver", ability1: "Halt" },
	{name: "Reinhardt", class: "tank", lmb: "Hammer", ability1: "Charge", ability2: "Firestrike", ult: "Earth Shatter"},
	{name: "Roadhog", class: "tank", lmb: "Scrap Gun: close", rmb: "Scrap Gun: mid", ability1: "Hook", ult: "Whole Hog"},
	{name: "Winston", class: "tank", lmb: "Tesla Gun", ability1: "Jump Pack", ult: "Primal Rage"},
	{name: "Zarya", class: "tank", lmb: "Particle Cannon", rmb: "Particle Bomb", ult: "Graviton Surge"},
	{name: "Ana", class: "support", lmb: "Hip-shot", rmb: "Scoped", ability1: "Sleep", ability2: "Grenade", ult: "Nanoboost"},
	{name: "Lucio", class: "support", lmb: "Sonic Amplifier", rmb: "Sonic Pulse"},
	{name: "Mercy", class: "support", lmb: "lol, rekt"},
	{name: "Symmetra", class: "support", lmb: "Photon Beam", rmb: "Photon Projector", ability1: "Photon Turret"},
	{name: "Zenyatta", class: "support", lmb: "Orb of Destruction", rmb: "Orb Volley"}
];