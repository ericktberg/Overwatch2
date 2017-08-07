/* global OVERWATCH*/


/* A radial Quadrant menu has 4 quadrants, each with their own radial pattern
 * 
 * Useful for selections
 * @type 
 */
OVERWATCH.radialQuadrantMenu = (function(){
    /* Onclick select function
     */
    function select() {
        console.log($(this).addClass("selected"));
    }
    
    function focus() {
        $(this).css("opacity", ".9");
    }
    
    function defocus() {
        $(this).css("opacity", ".4");
    }
    
    function createElement(svg, x, y, circleRadius, data) {
        svg.append("circle")
                .attr("r", circleRadius)
                .attr("transform", "translate(" + x+ "," + y + ")")
                .attr("class", "select-item " + data.name)
                .style("opacity", ".4")
                .attr("name", data.name)
                .on("mouseover", focus)
                .on("mouseout", defocus)
                //.on("click", select);
                ;
    }
    
    /* Create row of a radial menu, populated with circles of desired radius.
    * Class the created elements according to data[name]
    */
    function createRow(svg, rowNumb, circleRadius, center, quadrant, data) {
        var circlesInRow = 2*rowNumb;
            
        var i,
            degrees = Math.PI/(2*circlesInRow-2),
            distance = rowNumb*circleRadius*2.2;
        var x = 0;
        var y = 0;
        for (i = 0; i < circlesInRow && i < data.length; i++) {
            x = center.x + quadrant.x*Math.cos(i*degrees)*distance;
            y = center.y + quadrant.y*Math.sin(i*degrees)*distance;
            
            createElement(svg, x, y, circleRadius, data[i])
        }
    };

    /* Fill out an entire quadrant
    * Compute the number of rows needed on the fly and partially fill the last.
    * Data dependent on how many elements are created and what the result will look like
    * 
    * TODO: Algorithm can currently only handle 3 rows without overlapping circles.
    */
    function createQuadrant(svg, quadNum, data, radius) {
        var quadrant = [{x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}][quadNum - 1];

        var numOfRows = 0;
        var elementsLeft = data.length;
        var c = {x: quadrant.x*(radius*2.5)/2, y: quadrant.y*(radius*2.5)/2};

        createElement(svg, c.x, c.y, radius, data[0]);
        
        elementsLeft--;

        data = data.slice(1);

        while(elementsLeft > 0) {
            createRow(svg, ++numOfRows, radius, c, quadrant, data);
            data = data.slice(2*numOfRows);
            elementsLeft = elementsLeft -  2*numOfRows;
        }
    };
    
    return {
        // By Moving these creation functions into another lambda expression, we can have instanceable menus.
        'create': (function() {
            // Instance variables
            var boundingBox = null;
            var container = null;
            
            return {
                /* Initialize a new menu with data
                 */
                'init': function(svg, q1, q2, q3, q4) {
                    container = svg.append("g").attr("class", "select-items");

                    createQuadrant(container, 1, q1, 30);
                    createQuadrant(container, 2, q2, 30);
                    createQuadrant(container, 3, q3, 30);
                    createQuadrant(container, 4, q4, 30);
                    
                    
                },
                /* Some menus will need to be moved to certain locations, take input and move there.
                 */
                'moveTo': function(x, y) {
                    container.attr("transform", "translate(" + x + "," + y + ")");
                },
                /* Reset all selections previously made
                 * 
                 */
                'reset': function() {
                    
                },
                'getSelection': function() {
                    
                }
            };
        })()
    };
})();

OVERWATCH.modal = (function (){
    var openCount = 0;
    
    return {
        'open': function(modalID) {
            $('.modal-wrapper, #'+modalID).addClass('is-active');
            openCount++;
        },
        'close': function(modalID) {
            openCount--;
            if (openCount === 0) {
                $('.modal-wrapper').removeClass('is-active');
            }
            $('#'+modalID).removeClass('is-active');
        }
    };
})();