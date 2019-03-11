/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var canvas;
var ctx;
var w, h;
var cameraPos = [0, 0];
var fixedDeltaTime = 1 / 60;
var maxSubSteps = 10;
var world;
var characterBody;
var player;

// Collision groups
var SCENERY_GROUP = 0x01;
var PLAYER_GROUP = 0x02;

var Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle;

var app = new Application({
    width: 1920,
    height: 1024,
    resolution: 0.7
});

var zoom = 1;

// app.stage.scale.x = zoom;
app.stage.scale.y = -1;

var tilemap = {};
var playerView = void 0;

// laod background
loader.add('background', '/img/teamfun/Background2.png').add('player', '/img/teamfun/player.png');

parseTileMap('/img/teamfun/tilemapjsontestcsv.json');

document.body.appendChild(app.view);

function init() {
    setBackground();

    // Init canvas
    canvas = document.getElementById("myCanvas");
    w = canvas.width;
    h = canvas.height;
    ctx = canvas.getContext("2d");
    ctx.lineWidth = 1 / zoom;

    // Init world
    world = new p2.World();

    tilemap.draw();
    setPlayer();

    // Add some scenery
    // addStaticBox(0, -800, 500, 5);
    // addStaticBox(0, -980, 100, 1);
    // addStaticPolygon(0,-400, [[0,3], [0,1], [2,2]]);
    addWalls();

    // Add a character body
    var characterShape = new p2.Box({
        width: 78,
        height: 78,
        collisionGroup: PLAYER_GROUP
    });
    characterBody = new p2.Body({
        mass: 0,
        position: [60, -600],
        fixedRotation: true,
        damping: 0,
        type: p2.Body.KINEMATIC
    });
    characterBody.addShape(characterShape);
    world.addBody(characterBody);

    // Create the character controller
    player = new p2.KinematicCharacterController({
        world: world,
        body: characterBody,
        collisionMask: SCENERY_GROUP,
        velocityXSmoothing: 0.0001,
        timeToJumpApex: 0.4,
        skinWidth: 0.1,
        moveSpeed: 300
    });

    player.gravity = -800;
    player.maxJumpVelocity = 500;
    player.minJumpVelocity = 400;
    console.log(player);

    // Update the character controller after each physics tick.
    world.on('postStep', function () {
        player.update(world.lastTimeStep);
    });

    // Set up key listeners
    var left = 0,
        right = 0;
    window.addEventListener('keydown', function (evt) {
        switch (evt.keyCode) {
            case 38: // up key
            case 32:
                player.setJumpKeyState(true);break; // space key
            case 39:
                right = 1;break; // right key
            case 37:
                left = 1;break; // left key
        }
        player.input[0] = right - left;
    });
    window.addEventListener('keyup', function (evt) {
        switch (evt.keyCode) {
            case 38: // up
            case 32:
                player.setJumpKeyState(false);break;
            case 39:
                right = 0;break;
            case 37:
                left = 0;break;
        }
        player.input[0] = right - left;
    });

    requestAnimationFrame(animate);
}

function setPlayer() {
    playerView = new PIXI.Sprite(PIXI.loader.resources['player'].texture);
    // playerView.position.set(350,-500);

    playerView.scale.y = -1;

    app.stage.addChild(playerView);
}

function setBackground() {
    var bg = new PIXI.Sprite(PIXI.loader.resources['background'].texture);
    app.stage.addChild(bg);
}

function addStaticPolygon(x, y, vertices) {
    console.log(vertices);
    var shape = new p2.Convex({
        collisionGroup: SCENERY_GROUP,
        vertices: vertices
    });
    var body = new p2.Body({
        position: [x, y]
    });
    body.addShape(shape);
    world.addBody(body);
}

function addStaticBox(x, y, width, height) {
    var shape = new p2.Box({
        collisionGroup: SCENERY_GROUP,
        width: width,
        height: height
    });
    var body = new p2.Body({
        position: [x, y]
    });
    body.addShape(shape);
    world.addBody(body);
}

function addWalls() {
    var horizontalTop = new p2.Body();
    horizontalTop.addShape(new p2.Plane());
    world.addBody(horizontalTop);

    var horizontalBottom = new p2.Body();
    horizontalBottom.addShape(new p2.Plane());
    horizontalBottom.position = [0, -970];
    // horizontalBottom.position = [0,-app.renderer.screen.height]
    world.addBody(horizontalBottom);

    var verticalLeft = new p2.Body({ angle: Math.PI / 2 });
    verticalLeft.addShape(new p2.Plane({ collisionGroup: SCENERY_GROUP }));
    world.addBody(verticalLeft);

    var verticalRight = new p2.Body({ angle: Math.PI / 2 });
    verticalRight.addShape(new p2.Plane({ collisionGroup: SCENERY_GROUP }));
    verticalRight.position = [app.renderer.screen.width, 0];
    world.addBody(verticalRight);
}

function drawBody(body) {
    var x = body.interpolatedPosition[0],
        y = body.interpolatedPosition[1],
        s = body.shapes[0];
    ctx.save();
    ctx.translate(x, y); // Translate to the center of the box
    ctx.rotate(body.interpolatedAngle); // Rotate to the box body frame

    if (s instanceof p2.Box) {
        ctx.fillRect(-s.width / 2, -s.height / 2, s.width, s.height);
    } else if (s instanceof p2.Circle) {
        ctx.beginPath();
        ctx.arc(0, 0, s.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    } else if (s instanceof p2.Convex) {
        console.log('sssss', s);

        ctx.beginPath();
        ctx.moveTo(s.vertices[0][0], s.vertices[0][1]);
        for (var i = 1; i < s.vertices.length; i++) {
            s.vertices[i];
            ctx.lineTo(s.vertices[i][0], s.vertices[i][1]);
        }
        ctx.fill();
        ctx.closePath();
    }

    ctx.restore();
}

function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);

    // Transform the canvas
    // Note that we need to flip the y axis since Canvas pixel coordinates
    // goes from top to bottom, while physics does the opposite.
    ctx.save();
    ctx.translate(w / 2, h / 2); // Translate to the center
    ctx.scale(zoom, -zoom); // Zoom in and flip y axis

    p2.vec2.lerp(cameraPos, cameraPos, [-characterBody.interpolatedPosition[0], -characterBody.interpolatedPosition[1]], 0.05);
    ctx.translate(cameraPos[0], cameraPos[1]);

    // Draw all bodies
    ctx.strokeStyle = 'none';
    ctx.fillStyle = 'red';
    for (var i = 0; i < world.bodies.length; i++) {
        var body = world.bodies[i];
        drawBody(body);
    }

    // Restore transform
    ctx.restore();
}

var lastTime;

// Animation loop
function animate(time) {
    playerView.x = characterBody.position[0];
    playerView.y = characterBody.position[1];

    requestAnimationFrame(animate);

    // Compute elapsed time since last frame
    var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
    deltaTime = Math.min(1 / 10, deltaTime);

    // Move physics bodies forward in time
    world.step(fixedDeltaTime, deltaTime, maxSubSteps);

    // Render scene
    render();

    lastTime = time;
}

function parseTileMap(tilemapSource) {
    fetch(tilemapSource).then(function (res) {
        return res.json();
    }).then(function (data) {
        console.log('all json data', data);
        console.log('------------------------------------');

        tilemap.rows = data.height;
        tilemap.cols = data.width;
        tilemap.tileWidth = data.tilewidth;
        tilemap.tileHeight = data.tileheight;
        tilemap.tilemapPrefix = 'tileimg';
        tilemap.collisions = {};
        tilemap.layers = data.layers.map(function (layer) {
            return {
                data: layer.data
            };
        });
        tilemap.tilesets = data.tilesets.map(function (tileset) {
            return {
                firstgid: tileset.firstgid,
                tiles: tileset.tiles
            };
        });
        console.log('Tilemap', tilemap.tilesets);
        console.log('------------------------------------');
        tilemap.loadTiles();
        console.log(tilemap.collisions);
    });
    tilemap.loadTiles = function () {
        var tileImagesArr = [];
        var tilemapPrefix = tilemap.tilemapPrefix;
        var pathToImages = '/img/teamfun/';
        this.tilesets.map(function (tileset) {
            var tileStartId = tileset.firstgid;
            tileImagesArr = [].concat(_toConsumableArray(tileImagesArr), _toConsumableArray(tileset.tiles.map(function (tile) {
                var tileId = tile.id + tileStartId;

                //collisions
                if (tile.objectgroup) {
                    tile.objectgroup.objects.map(function (collision) {
                        tilemap.collisions[tileId] = collision;
                        if (collision.polygon != undefined) {
                            var polygonArray = [];
                            polygonArray = [].concat(_toConsumableArray(polygonArray), _toConsumableArray(collision.polygon.map(function (point) {
                                return [point.x, point.y];
                            })));
                            tilemap.collisions[tileId].polygonArr = polygonArray;
                        }
                        tilemap.collisions[tileId].image = {
                            height: tile.imageheight,
                            width: tile.imagewidth
                        };
                    });
                }
                //tile images
                return {
                    'alias': tilemapPrefix + tileId,
                    'src': tile.image
                };
            })));
        });
        console.log(tileImagesArr);

        // load images to pixi
        tileImagesArr.map(function (img) {
            return loader.add(img.alias, pathToImages + img.src);
        });
        loader.load(init);
    };
    tilemap.draw = function () {
        var tileWidth = tilemap.tileWidth;
        var tileHeight = tilemap.tileHeight;
        var cols = tilemap.cols;
        tilemap.layers.map(function (layer) {
            var rowNumber = 1;
            layer.data.map(function (tile, index) {
                if (tile != 0) {
                    var tileX = (index - cols * (rowNumber - 1)) * tileWidth;
                    var tileY = rowNumber * tileHeight;

                    tilemap.setTileOnMap(tileX, tileY, '' + tilemap.tilemapPrefix + tile);
                    tilemap.setCollisions(tileX, tileY, tile);
                }
                if ((index + 1) % cols == 0) rowNumber += 1;
            });
        });
    };
    tilemap.setTileOnMap = function (x, y, alias) {
        var tile = new PIXI.Sprite(PIXI.loader.resources[alias].texture);
        tile.position.set(x, -(y - tile.height));
        tile.scale.y = -1;
        app.stage.addChild(tile);
    };
    tilemap.setCollisions = function (x, y, id) {
        var collisionData = tilemap.collisions[id];
        if (collisionData) {
            var collisionX = x + collisionData.x;
            var collisionY = y - collisionData.image.height + collisionData.y;
            if (collisionData.polygon != undefined) {
                console.log('polygon', collisionData);
                addStaticPolygon(collisionX, -collisionY, collisionData.polygonArr);
            } else if (collisionData.ellipse != undefined) {
                // console.log('ellipse', collisionData);

            } else {
                // rectangle collision
                // console.log('rectangle',collisionData);
                addStaticBox(collisionX, -collisionY, collisionData.width, collisionData.height);
            }
        }
    };
}

/***/ })

/******/ });
//# sourceMappingURL=canvas.bundle.js.map