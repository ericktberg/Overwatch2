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

var OVERWATCH = {}

OVERWATCH.index = (function() {
    var INFO = false;

    

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
        OVERWATCH.state.render(url);
    });
    
    /* To create a stateful single page application, when the url changes we have to rerender the page
     * This should be run on both document ready and whenever the hash changes
     * 
     * <a> tags will change hash URIs only
     */
    $(window).on('hashchange', function() {
        var url = decodeURI(window.location.hash);
        
        OVERWATCH.state.render(url);
    });

    // Public members of OVERWATCH.index
    return {
        
        CreateGameMenu: {
            open: function() { $('#CreateGameMenu').addClass('is-open'); },
            close: function() { $('#CreateGameMenu').removeClass('is-open'); }
        },
        
        ContextWindow: {
            open: function(side) { 
                $('#PrimaryNav > nav, .side-menu.' + side).addClass('is-open'); 
            },
            close: function(side) { 
                $('#PrimaryNav > nav, .side-menu.' + side).removeClass('is-open'); 
            },
            toggle: function (side) {
                $('#PrimaryNav > nav, .side-menu.' + side).toggleClass('is-open');
            }
        }

    };
})();

OVERWATCH.state = (function() {
    var viewHandle = {};
    
    return {
        render: function(url) {
            var pagename = url.split('/')[0];

            
            // Remove active contexts
            $('.is-active').removeClass('is-active');
            // Remove any data currently rendered

            console.log(viewHandle.cleanup);
            if (viewHandle.cleanup) {
                viewHandle.cleanup();
            }

            var map = {
                // Homepage function
                '': 0,

                '#input': OVERWATCH.input.view,

                '#point': OVERWATCH.point.view,

                '#hexmap': OVERWATCH.hex.view
            };

            if(map[pagename]) {
                viewHandle = map[pagename]() || {};
            }
            else {
                renderErrorPage();
            }
        }
    };
})();


OVERWATCH.point = (function() {
    return {
        view: function() {
            OVERWATCH.index.ContextWindow.open('left');
            $('.context-point').addClass('is-active');
            OVERWATCH.modal.open('HeroSelect');
        }
    }
})();

OVERWATCH.hex = (function() {
    return {
        view: function() {
            OVERWATCH.index.ContextWindow.open('left');
            $('.context-hex').addClass('is-active');
        }
    }
})();






OVERWATCH.maps = (function() {
    var currentMap = "";
    
    var list = {
        "Hanamura": {basement: "images/Hanamura_neg1.jpg", ground: "images/Hanamura_0.jpg", one: "images/Hanamura_1.jpg", two: "images/Hanamura_2.jpg", width: 793, height: 800}
    };
    
    

    return {
        /* svg - a d3 selection of an existing svg
         * 
         * Create a container and append all 4 levels of a map.
         */
        'draw' : function(svg) {
            var container = svg.append("g").attr("class", "container");
            var map = list[currentMap];

            if (!map) {
                console.log("map is not set");
                return null;
            }
            var zoom = d3.zoom()
                    .scaleExtent([.5, 5])
                    .on("zoom", function() { container.attr("transform", d3.event.transform); });
            svg.call(zoom);


            // Each map has 4 levels
            var basement = container.append("g").attr("class", "floor").attr("transform", "translate(" + 0 + "," + 0 + ")");
            var ground = container.append("g").attr("class", "floor").attr("transform", "translate(" + map.width + "," + 0 + ")");
            var one = container.append("g").attr("class", "floor").attr("transform", "translate(" + 0 + "," + map.height + ")");
            var two = container.append("g").attr("class", "floor").attr("transform", "translate(" + map.width + "," + map.height + ")");

            basement.append("svg:image")
                .attr("height", map.height)
                .attr("width", map.width)
                .attr("xlink:href",map.basement);

            ground.append("svg:image")
                .attr("height", map.height)
                .attr("width", map.width)
                .attr("xlink:href",map.ground);

            one.append("svg:image")
                .attr("height", map.height)
                .attr("width", map.width)
                .attr("xlink:href",map.one);

            two.append("svg:image")
                .attr("height", map.height)
                .attr("width", map.width)
                .attr("xlink:href",map.two);

            return container;
        },
        /* Map state is controlled inside this lambda.
         * 
         * Setter function for the current map
         */
        setMap: function(newMap) {
            currentMap = newMap;
        }
    };
})();


OVERWATCH.heroes = (function() {
    var list = [
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
    
    return {
        'list': list,
        'attack': list.filter(function(d) {
            return d.class === "attack";
        }),
        'defense': list.filter(function(d) {
            return d.class === "defense";
        }),
        'tank': list.filter(function(d) {
            return d.class === "tank";
        }),
        'support': list.filter(function(d) {
            return d.class === "support";
        })
    };
})();

OVERWATCH.user = (function() {
    
    return {
        'get': function() {
            return 'Dan';
        }
    };
})();
