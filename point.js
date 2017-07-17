/* 
 * Display location and hero data directly
 * 
 * Data is stored in pairs of player/enemy
 *     - Player = circle
 *     - enemy = squares
 *     
 *     + Hovering over an element displays the corresponding element in the pair
 *     + Selecting an element displays extra information
 */

/* global map_  *** located in map.js */ 

/* Data taken is an array
 * Data must have
 *      - Player and enemy Character
 *      - Player X, Y, and Z
 *      - Enemy X, Y, and Z
*/
function drawPoints(container, data) { 
    var player,
        enemy;
    
    player = container.selectAll("node")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + elevateX(d.playerX, d.playerZ) + "," + elevateY(d.playerY, d.playerZ) + ")";
            })
            .each(function(d) { d.node = this; });
    
    enemy = container.selectAll("node")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + elevateX(d.enemyX, d.enemyZ) + "," + elevateY(d.enemyY, d.enemyZ) + ")";
            })
            .each(function(d) { d.node = this;});
    
    player.append("circle")
            .attr("r", function(d) { return 7.5; });
    
    enemy.append("rect")
            .attr("height", function(d) { return 10;})
            .attr("width", function(d) { return 10;});
    
}

