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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/canvas.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/canvas.js":
/*!***********************!*\
  !*** ./src/canvas.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// import utils from './utils'
// import { log } from 'util';
var world = void 0,
    characterBody = void 0,
    cameraPos = [0, 0],
    player = void 0,
    fixedDeltaTime = 1 / 60,
    graphics = void 0,
    maxSubSteps = 10;
// Init world
world = new p2.World();

// Collision groups
var SCENERY_GROUP = 0x01;
var PLAYER_GROUP = 0x02;

// Add a character body
var characterShape = new p2.Box({
    width: 1,
    height: 1.5,
    collisionGroup: PLAYER_GROUP
});
characterBody = new p2.Body({
    mass: 0,
    position: [800, 800],
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
    skinWidth: 0.1
});

// Update the character controller after each physics tick.
world.on('postStep', function () {
    player.update(world.lastTimeStep);
});

p2.vec2.lerp(cameraPos, cameraPos, [-characterBody.interpolatedPosition[0], -characterBody.interpolatedPosition[1]], 0.05);

// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------

//Aliases
var Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle;

var app = new Application({
    width: 1920,
    height: 1024,
    resolution: 1
});

// laod background
loader.add('background', '/img/teamfun/Background2.png').add('player', '/img/teamfun/player.png');

var tilemap = {};
var playerView = void 0;

parseTileMap('/img/teamfun/tilemapjsontestcsv.json');

document.body.appendChild(app.view);

function setup() {
    setBackground();
    tilemap.draw();
    setPlayer();
    app.ticker.add(function (delta) {
        return update(delta);
    });
    console.log(world.bodies);
}
console.log('height----------', app.renderer.height);
render();
function update(delta) {
    world.step(1 / 60);
    // console.log(player.input[0]);
    // Transfer positions of the physics objects to Pixi.js
    graphics.position.x = characterBody.position[0];
    graphics.position.y = characterBody.position[1];
    console.log(graphics.position);
}

function render() {
    for (var i = 0; i < world.bodies.length; i++) {
        var body = world.bodies[i];
        drawBody(body);
    }
}

function drawBody(body) {
    var x = body.interpolatedPosition[0],
        y = body.interpolatedPosition[1],
        boxShape = body.shapes[0];

    graphics = new PIXI.Graphics();

    if (boxShape instanceof p2.Box) {
        graphics.beginFill(0xff0000);
        graphics.drawRect(-boxShape.width / 2, -boxShape.height / 2, boxShape.width, boxShape.height);
    }

    console.log(graphics);

    // Add the box to our container
    app.stage.addChild(graphics);
}

function setPlayer() {
    playerView = new PIXI.Sprite(PIXI.loader.resources['player'].texture);
    playerView.position.set(350, 500);
    playerView.vx = 0;
    playerView.vy = 5;

    app.stage.addChild(playerView);
}

function setBackground() {
    var bg = new PIXI.Sprite(PIXI.loader.resources['background'].texture);
    app.stage.addChild(bg);
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
        console.log('Tilemap', tilemap);
        console.log('------------------------------------');
        tilemap.loadTiles();
    });
    tilemap.loadTiles = function () {
        var tileImagesArr = [];
        var tilemapPrefix = tilemap.tilemapPrefix;
        var pathToImages = '/img/teamfun/';
        this.tilesets.map(function (tileset) {
            var tileStartId = tileset.firstgid;
            tileImagesArr = [].concat(_toConsumableArray(tileImagesArr), _toConsumableArray(tileset.tiles.map(function (tile) {
                return {
                    'alias': tilemapPrefix + (tile.id + tileStartId),
                    'src': tile.image
                };
            })));
        });
        // load images to pixi
        tileImagesArr.map(function (img) {
            return loader.add(img.alias, pathToImages + img.src);
        });
        loader.load(setup);
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
                }
                if ((index + 1) % cols == 0) rowNumber += 1;
            });
        });
    };
    tilemap.setTileOnMap = function (x, y, alias) {
        var tile = new PIXI.Sprite(PIXI.loader.resources[alias].texture);
        tile.position.set(x, y - tile.height);
        app.stage.addChild(tile);
    };
}

// Keyboard -------------------------------------------------

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
    console.log(evt.keyCode);
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

// Keyboard END -------------------------------------------------


function addStaticCircle(x, y, angle, radius) {
    var shape = new p2.Circle({
        collisionGroup: SCENERY_GROUP,
        radius: radius
    });
    var body = new p2.Body({
        position: [x, y],
        angle: angle
    });
    body.addShape(shape);
    world.addBody(body);
}

function addStaticBox(x, y, angle, width, height) {
    var shape = new p2.Box({
        collisionGroup: SCENERY_GROUP,
        width: width,
        height: height
    });
    var body = new p2.Body({
        position: [x, y],
        angle: angle
    });
    body.addShape(shape);
    world.addBody(body);
}

/***/ })

/******/ });
//# sourceMappingURL=canvas.bundle.js.map