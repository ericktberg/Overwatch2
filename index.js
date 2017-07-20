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

var INFO = true;

// When window loads, display default 
window.onload = function () {
    drawEnvironment(d3.select("#vizContent"));
    
    $.each(characters, function() {
        $("#heroSelect").append($("<option />").val(this.name).text(this.name));
    });
};

// Maps button
// On hover, display 
function mapButton() {
    
}

// Graph button
function graphButton() {
    
}

// A sidebar pops out for use in some visualizations.
// TopBar buttons are effected by sidebar positioning
function toggleSideBar() {
    $('#mapsButton').toggleClass("open");
    $('#graphsButton').toggleClass("open");
    $('#sideBar').toggleClass("open");
}

var characters = [
	{name: "Genji", lmb: "Shurikens", rmb: "Shuriken Fan", ability1: "Dash", ability2: "Deflect", ult: "Dragonblade"},
	{name: "McCree", lmb: "Peacekeeper", rmb: "Fan the Hammer",  ability1: "Flashbang", ult: "Deadeye"},
	{name: "Pharah", lmb: "Rocket", ability1: "Concussion Blast", ult: "Rocket Barrage"},
	{name: "Reaper", lmb: "Hellfire Shotguns", ult: "Death Blossom"},
	{name: "Soldier", lmb: "COD Gun", ability1: "Helix Rocket", ult: "Tactical Visor"},
	{name: "Sombra", lmb: "Machine Pistol", ability1: "Hack", ult: "EMP"},
	{name: "Tracer", lmb: "Pulse Pistols", ult: "Pulse Bomb"},
	{name: "Bastion", lmb: "Configuration: Recon", rmb: "Configuration: Sentry", ult: "Configuration: Tank"},
	{name: "Hanzo", lmb: "Tree trunks", ability1: "Scatter Arrow", ability2: "Sonic Arrow", ult: "Dragonstrike"},
	{name: "Junkrat", lmb: "Grenade Launcher", ability1: "Concussion Mine", ability2: "Trap", ult: "Tire"},
	{name: "Mei", lmb: "Freeze", rmb: "Icicle", ult: "Blizzard"},
	{name: "Torbjorn", lmb: "Rivet Gun", rmb: "Shotgun", ability1: "Turret", ult: "Molten Core"},
	{name: "Widowmaker", lmb: "SMG", rmb: "Scope", ability1: "Venom Mine", ult: "Walls"},
	{name: "D.va", lmb: "Popcorn gun", ability1: "Rocket Booster", ult: "Self-Destruct"},
	{name: "Orisa", lmb: "Fusion Driver", ability1: "Halt" },
	{name: "Reinhardt", lmb: "Hammer", ability1: "Charge", ability2: "Firestrike", ult: "Earth Shatter"},
	{name: "Roadhog", lmb: "Scrap Gun: close", rmb: "Scrap Gun: mid", ability1: "Hook", ult: "Whole Hog"},
	{name: "Winston", lmb: "Tesla Gun", ability1: "Jump Pack", ult: "Primal Rage"},
	{name: "Zarya", lmb: "Particle Cannon", rmb: "Particle Bomb", ult: "Graviton Surge"},
	{name: "Ana", lmb: "Hip-shot", rmb: "Scoped", ability1: "Sleep", ability2: "Grenade", ult: "Nanoboost"},
	{name: "Lucio", lmb: "Sonic Amplifier", rmb: "Sonic Pulse"},
	{name: "Mercy", lmb: "lol, rekt"},
	{name: "Symmetra", lmb: "Photon Beam", rmb: "Photon Projector", ability1: "Photon Turret"},
	{name: "Zenyatta", lmb: "Orb of Destruction", rmb: "Orb Volley"}
];