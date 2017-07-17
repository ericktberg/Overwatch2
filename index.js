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