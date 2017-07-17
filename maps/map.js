/* 
 * Shared map functions.
 * Maps have 4 levels: basement, ground, 1, and 2
 * 
 * 
 * Facts:
 *   - There is a default map always selected.
 *   - Only one map may be selected at a time.
 *   - Map data relates directly to the map image.
 *   - Maps redraw on parameter changes.
 *   - Map display style can be changed responsively.
 *   - Map data shares zoom with the background image.
 *   
 * Global Variables:
 *   map_ - The currently selected map
 * 
 * Referenced Variables:
 *   maps_d - a list of maps and corresponding metadata (image url, dimensions)
 */


/* global d3 */

var map_ = "Hanamura";
var maps_d = {
    "Hanamura": {b: "images/Hanamura_neg1.jpg", g: "images/Hanamura_0.jpg", one: "images/Hanamura_1.jpg", two: "images/Hanamura_2.jpg", width: 793, height: 800}
};

// Draw data to canvas
// References button parameters
function drawData() {
    
}

// Parameters have changed, update the data corresponding
// All buttons call update when clicked?
function update() {
    
}

// Erase data from canvas
// TODO: name
function eraseData() {
    
}

// Erase everything from canvas, including environment
// TODO: name
function clearCanvas() {
    
}

// root is a d3 selection of the map visualisations root element
function drawEnvironment(root) {
    var svg;
    var container;
    var map = maps_d[map_];
    
    var zoom = d3.zoom()
            .scaleExtent([.5, 5])
            .on("zoom", function() { container.attr("transform", d3.event.transform); });
    
    svg = root.append("svg")
            .attr("width", "100%")
            .attr("height", "980")
            .call(zoom);
    
    container = svg.append("g").attr("class", "container");
    // Draw the environment overlay
    
    // zoom slider
    // Attack Defense buttons
    // Hero selection
    // Map selection
    // Elim/Death button
    // User to analyze
    drawMap(container, map);
}

function drawMap(container, map) {
    // Each map has 4 levels
    var b = container.append("g").attr("class", "floor").attr("transform", "translate(" + 0 + "," + 0 + ")");
    var g = container.append("g").attr("class", "floor").attr("transform", "translate(" + map.width + "," + 0 + ")");
    var one = container.append("g").attr("class", "floor").attr("transform", "translate(" + 0 + "," + map.height + ")");
    var two = container.append("g").attr("class", "floor").attr("transform", "translate(" + map.width + "," + map.height + ")");

    b.append("svg:image")
        .attr("height", map.height)
        .attr("width", map.width)
        .attr("xlink:href",map.b);

    g.append("svg:image")
        .attr("height", map.height)
        .attr("width", map.width)
        .attr("xlink:href",map.g);

    one.append("svg:image")
        .attr("height", map.height)
        .attr("width", map.width)
        .attr("xlink:href",map.one);

    two.append("svg:image")
        .attr("height", map.height)
        .attr("width", map.width)
        .attr("xlink:href",map.two);
}

function setActiveMap(new_map) {
    map_ = new_map;
}

// A slider controls zoom levels
function zoomSlider() {
    
}