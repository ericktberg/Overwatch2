/* global OVERWATCH */

OVERWATCH.point = (function() {
    function DataToMap(data) {
        $("#MainViz").empty();
        var svg = d3.select("#MainViz");
        OVERWATCH.index.container = OVERWATCH.maps.draw(svg);
        $.each(data, function(i, val) {
            OVERWATCH.point.createPair(val);
        });
    }
    
    return {
        'createPair': function(data) {
            var player = OVERWATCH.point.createPlayer(data.playerCharacter, data.playerX, data.playerY);
            var enemy = OVERWATCH.point.createEnemy(data.enemyCharacter, data.enemyX, data.enemyY);

            var over = function() {
                enemy.attr("width", 15).attr("height", 15);
                player.attr("r", 10); 
            };

            var out = function() {
                enemy.attr("width", 10).attr("height", 10);
                player.attr("r", 7.5);
            };

            enemy.on("mouseover", over)
                    .on("mouseout", out);

            player.on("mouseover", over)
                    .on("mouseout", out);
        },
        
        createPlayer: function(hero, x, y) {
            return OVERWATCH.index.container.append("circle")
                    .attr("r", 7.5)
                .attr("transform", "translate(" + x + "," + y + ")")
                .attr("class", hero)
                .on("contextmenu", function() { d3.event.preventDefault(); });  ;
        },

        createEnemy: function(hero, x, y) {
            return OVERWATCH.index.container.append("rect")    
                    .attr("height", 10)
                    .attr("width", 10)
                    .attr("transform", "translate(" + (x-5) + "," + (y-5) + ")")
                    .attr("class", hero)
                    .on("contextmenu", function() { d3.event.preventDefault(); });;
        },
        
        view: function() {
            OVERWATCH.index.ContextWindow.open('left');
            
            $('.context-point').addClass('is-active');
            
            return {
                cleanup: null,
                loadGame: DataToMap
            };
        }
        
    };
})();