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


/*  When window loads, display default content
 *  Set behaviors and fill-in data for DOM elements
 *      TODO: DOM elements that are not being referenced can be filled in when they become relevant
 * 
 * @type type
 */
$(document).ready(function () {
    drawEnvironment(d3.select("#vizContent"));
    
    $("#datepicker").datepicker();
    
    heroSelect();
    
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

/* The hero select menu is a variant of a radial menu.
 * 
 * It has a center and four quadrants surrounding the center
 * Each quadrant represents a class
 * 
 * Elements are placed in their corresponding quadrant in a radial pattern
 * The center of the circle the radial pattern is translated to begin within each quadrant
 */

function heroSelect() {
    var root = d3.select("#inputModal");
    var svg = root.append("svg").attr("height", "100%").attr("width", "100%").attr("id", "heroSelect");
    var c = {x: 800, y: 500};
    
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
    
    var heroClick = function(d) { console.log($(this).addClass("selected")); };
    var heroHover = function(d) { console.log(d); };
    
    createQuadrant(svg, 1, heroClick, heroHover, attack, 30, c);
    createQuadrant(svg, 2, heroClick, heroHover, defense, 30, c);
    createQuadrant(svg, 3, heroClick, heroHover, support, 30, c);
    createQuadrant(svg, 4, heroClick, heroHover, tank, 30, c);
}

/* Create row of a radial menu, populated with circles of desired radius.
* Class the created elements according to data[name]
*/
var createRow = function(svg, clicked, hovered, rowNumb, circleRadius, center, quadrant, data) {
    var circlesInRow = 2*rowNumb;

    var i,
        degrees = Math.PI/(2*circlesInRow-2),
        distance = rowNumb*circleRadius*2.2;

    for (i = 0; i < circlesInRow && i < data.length; i++) {
        svg.append("circle")
            .attr("r", circleRadius)
            .attr("transform", "translate(" + (center.x + quadrant.x*Math.cos(i*degrees)*distance) + "," + (center.y + quadrant.y*Math.sin(i*degrees)*distance) + ")")
            .attr("class", "menu " + data[i].name)
            .attr("name", data[i].name)
            .on("mouseover", hovered)
            .on("click", clicked);
    }
};

/* Fill out an entire quadrant
* Compute the number of rows needed on the fly and partially fill the last.
* Data dependent on how many elements are created and what the result will look like
* 
* TODO: Algorithm can currently only handle 3 rows without overlapping circles.
*/
var createQuadrant = function(svg, quadNum, clicked, hovered, data, radius, center) {
    var quadrant = [{x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}][quadNum - 1];
    
    var numOfRows = 0;
    var elementsLeft = data.length;
    var c = {x: center.x + quadrant.x*(radius*2.5)/2, y: center.y + quadrant.y*(radius*2.5)/2};

    svg.append("circle")
            .attr("r", radius)
            .attr("transform", "translate(" + c.x + "," + c.y + ")")
            .attr("class", "menu " + data[0].name)
            .attr("name", data[i].name)
            .on("mouseover", hovered)
            .on("click", clicked);
    elementsLeft--;
    
    data = data.slice(1);

    while(elementsLeft > 0) {
        createRow(svg, clicked, hovered, ++numOfRows, radius, c, quadrant, data);
        data = data.slice(2*numOfRows);
        elementsLeft = elementsLeft -  2*numOfRows;
    }
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