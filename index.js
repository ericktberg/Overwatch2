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