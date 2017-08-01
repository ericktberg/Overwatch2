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


var CreateGame = {
    toggle: function() { $('#CreateGame').toggleClass('is-open'); }
};

var ContextMenu = {
    toggle: function() { 
        $('#PrimaryNav > nav, #ContextMenu').toggleClass('is-open'); 
    }
};

/*  When window loads, display default content
 *  Set behaviors and fill-in data for DOM elements
 *      TODO: DOM elements that are not being referenced can be filled in when they become relevant
 * 
 * @type type
 */
$(document).ready(function () {    
    // Setup all datepickers on load.
    $(".datepicker").datepicker();
    
    
    var url = decodeURI(window.location.hash);
    
    render(url);
    
});

$(window).on('hashchange', function() {
        var url = decodeURI(window.location.hash);
        
        render(url);
});

/* Display the input view.
 * 
 * @returns {undefined}
 */
function inputView() {
    $('.context-input').addClass('is-active');
}

function pointView() {
    $('.context-point').addClass('is-active');
}

function hexView() {
    $('.context-hex').addClass('is-active');
}

/* Decide which page to show then render that page.
 * This is a single page application, so the page is entirely based on the hash url
 * 
 * @param {type} url
 * @returns {undefined}
 */
function render(url) {
    var pagename = url.split('/')[0];
    
    // Remove active contexts
    $('.is-active').removeClass('is-active');
    
    var map = {
        // Homepage function
        '': 0,
        
        '#input': inputView,

        '#point': pointView,
        
        '#hexmap': 0
    };
    
    if(map[pagename]) {
        map[pagename]();
    }
    else {
        renderErrorPage();
    }
    
}



/* Open up the sidebar and adjust nav-bar accordingly
 */
function toggleSidebar() {
    $('#PrimaryNav > nav, #MainBody .side-menu').toggleClass('is-open');
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