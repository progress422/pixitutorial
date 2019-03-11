<<<<<<< HEAD
// import utils from './utils'
// import { log } from 'util';
let world,
    characterBody,
    cameraPos = [0, 0],
    player,
    fixedDeltaTime = 1 / 60,
    graphics,
    maxSubSteps = 10;
// Init world
world = new p2.World();

// Collision groups
const SCENERY_GROUP = 0x01;
const PLAYER_GROUP = 0x02;

// Add a character body
let characterShape = new p2.Box({
    width: 1,
    height: 1.5,
    collisionGroup: PLAYER_GROUP
});
characterBody = new p2.Body({
    mass: 0,
    position:[800,800],
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
world.on('postStep', function(){
    player.update(world.lastTimeStep);
});

p2.vec2.lerp(
    cameraPos,
    cameraPos,
    [-characterBody.interpolatedPosition[0], -characterBody.interpolatedPosition[1]],
    0.05
);

// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------

=======
>>>>>>> 53511934982b364e3e509990d55c1e7233118c18
//Aliases
const Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle;

const app = new Application({
    width: 1920,
    height: 1024,
    resolution: 1
});


// laod background
loader.add('background', '/img/teamfun/Background2.png')
.add('player', '/img/teamfun/player.png');

const tilemap = {};
let playerView;

parseTileMap('/img/teamfun/tilemapjsontestcsv.json');


 
document.body.appendChild(app.view);

function setup() {
    setBackground();
    tilemap.draw();
    setPlayer();
    app.ticker.add(delta => update(delta));
    console.log(world.bodies);
    
}
console.log('height----------',app.renderer.height);
render();
function update(delta) {
    world.step(1/60);
    // console.log(player.input[0]);
    // Transfer positions of the physics objects to Pixi.js
    graphics.position.x = characterBody.position[0];
    graphics.position.y = characterBody.position[1];
    console.log(graphics.position);
    
}

function render() {
    for(var i=0; i<world.bodies.length; i++){
        var body = world.bodies[i];
        drawBody(body);
    }
}

function drawBody(body){
    let x = body.interpolatedPosition[0],
        y = body.interpolatedPosition[1],
        boxShape = body.shapes[0];

    graphics = new PIXI.Graphics();

    if(boxShape instanceof p2.Box){
      graphics.beginFill(0xff0000);
      graphics.drawRect(-boxShape.width/2, -boxShape.height/2, boxShape.width, boxShape.height);
    }
    
    console.log(graphics);
    
    // Add the box to our container
    app.stage.addChild(graphics);
}

function setPlayer() {
    playerView = new PIXI.Sprite(
        PIXI.loader.resources['player'].texture
    );
    playerView.position.set(350,500);
    playerView.vx = 0;
    playerView.vy = 5;

    app.stage.addChild(playerView);
}

function setBackground() {
    let bg = new PIXI.Sprite(
        PIXI.loader.resources['background'].texture
    );
    app.stage.addChild(bg);
}

function parseTileMap(tilemapSource){
    fetch(tilemapSource)
    .then(res => res.json())
    .then(data => {
        console.log('all json data',data);
        console.log('------------------------------------');
        
        tilemap.rows = data.height;
        tilemap.cols = data.width;
        tilemap.tileWidth = data.tilewidth;
        tilemap.tileHeight = data.tileheight;
        tilemap.tilemapPrefix = 'tileimg';
        tilemap.layers = data.layers.map((layer) => {
            return {
                data: layer.data
            }
        });
        tilemap.tilesets = data.tilesets.map((tileset) => {
            return {
                firstgid: tileset.firstgid,
                tiles: tileset.tiles
            }
        });
        console.log('Tilemap',tilemap);
        console.log('------------------------------------');
        tilemap.loadTiles();
    });
    tilemap.loadTiles = function() {
        let tileImagesArr = [];
        let tilemapPrefix = tilemap.tilemapPrefix;
        const pathToImages = '/img/teamfun/';
        this.tilesets.map((tileset) => {
            let tileStartId = tileset.firstgid;
            tileImagesArr = [...tileImagesArr, ...tileset.tiles.map((tile) => {
                return {
                    'alias': tilemapPrefix + (tile.id + tileStartId),
                    'src': tile.image
                }
            })]
        });
        // load images to pixi
        tileImagesArr.map((img) => loader.add(img.alias, pathToImages + img.src));
        loader.load(setup);
    }
    tilemap.draw = function() {
        let tileWidth = tilemap.tileWidth;
        let tileHeight = tilemap.tileHeight;
        let cols = tilemap.cols;
        tilemap.layers.map((layer) => {
            let rowNumber = 1;
            layer.data.map((tile, index) => {
                if (tile != 0) {
                    let tileX = (index - cols*(rowNumber-1)) * tileWidth;
                    let tileY = rowNumber * tileHeight;
                    
                    tilemap.setTileOnMap(tileX,tileY,`${tilemap.tilemapPrefix}${tile}`);
                }
                if ((index + 1)%cols == 0)
                    rowNumber += 1;
            });
        });
    }
    tilemap.setTileOnMap = function(x,y,alias) {
        let tile = new PIXI.Sprite(
            PIXI.loader.resources[alias].texture
        );
        tile.position.set(x,y-tile.height);
        app.stage.addChild(tile);
    }
}

// Keyboard -------------------------------------------------

// Set up key listeners
let left = 0, right = 0;
window.addEventListener('keydown', function(evt){
  switch(evt.keyCode){
    case 38: // up key
    case 32: player.setJumpKeyState(true); break; // space key
    case 39: right = 1; break; // right key
    case 37: left = 1; break; // left key
  }
  player.input[0] = right - left;
  console.log(evt.keyCode);
  
});
window.addEventListener('keyup', function(evt){
  switch(evt.keyCode){
    case 38: // up
    case 32: player.setJumpKeyState(false); break;
    case 39: right = 0; break;
    case 37: left = 0; break;
  }
  player.input[0] = right - left;
});

// Keyboard END -------------------------------------------------



function addStaticCircle(x, y, angle, radius){
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

function addStaticBox(x, y, angle, width, height){
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