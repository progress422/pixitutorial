// import utils from './utils'
// import { log } from 'util';
import Collisions from 'collisions';

// Create the collision system
const collision = new Collisions();

// Create a Result object for collecting information about the collisions
const collResult = collision.createResult();

// Create the player (represented by a Circle)
const collPlayer = collision.createPolygon(0, 0, [[0,0], [78,0], [78,78], [0,78]]);

// Create some walls (represented by Polygons)
// const wall1 = collision.createPolygon(400, 500, [[-60, -20], [60, -20], [60, 20], [-60, 20]], 1.7);
// const wall2 = collision.createPolygon(200, 100, [[-60, -20], [60, -20], [60, 20], [-60, 20]], 2.2);
// const wall3 = collision.createPolygon(400, 50, [[-60, -20], [60, -20], [60, 20], [-60, 20]], 0.7);
const wall4 = collision.createCircle(150,1000,30);

// Update the collision system
collision.update();

// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------
// -----------------------------------------------------------

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
let player;
let playerMoves = {
    speed: 5,
    blockLeft: false,
    blockRight: false,
    blockBottom: false,
    blockTop: false,
    left() {
        // player.vx = -this.speed;
        player.movingDirection = 'left';
    },
    right() {
        // player.vx = this.speed;
        player.movingDirection = 'right';
    },
    stop() {
        // player.vx = 0;
        player.movingDirection = '';
    }
}
parseTileMap('/img/teamfun/tilemapjsontestcsv.json');


 
document.body.appendChild(app.view);

function setup() {
    setBackground();
    tilemap.draw();
    setPlayer();
    // create a new Graphics object
    var graphics = new PIXI.Graphics();
    // set a fill color and an opacity
    graphics.beginFill(0xfff012,1);
    // draw a rectangle using the arguments as:  x, y, radius
    graphics.drawCircle(150,1000,30);
    graphics.drawPolygon([0, 0, 128,0, 128, 128, 0, 128]);
    graphics.endFill();
    // add it to your scene
    app.stage.addChild(graphics);
    app.ticker.add(delta => update(delta));
}
console.log('height----------',app.renderer.height);
function update(delta) {
    // Update the collision system
    player.prevX = player.x;
    player.prevY = player.y;
    if (player.y+player.height + player.vy > app.renderer.height){
        player.vy = 0;
        player.y = app.renderer.height - player.height;
        player.jump = false;
        player.yMomentum = 0;
    }
    // jump
    if (player.jump){
        player.yMomentum += player.gravity;
        player.vy = -player.jumpHeight + player.yMomentum;
    }
    //move
    if (player.movingDirection == 'right'){
        if (yChanged()){
            player.speedPerFrame = player.speedPerFrameInTheAir;
        } else {
            player.speedPerFrame = player.speedPerFrameOnTheGround;
        }
        if (player.vx <= player.maxSpeed)
            player.vx += player.speedPerFrame;
    } else if (player.movingDirection == 'left') {
        if (yChanged()){
            player.speedPerFrame = player.speedPerFrameInTheAir;
        } else {
            player.speedPerFrame = player.speedPerFrameOnTheGround;
        }
        if (player.vx >= -player.maxSpeed)
            player.vx -= player.speedPerFrame;
    } else {
        if (yChanged()){
            player.speedPerFrame = player.speedPerFrameFalling;
        } else {
            player.speedPerFrame = player.speedPerFrameOnTheGround;
        }
        if (player.vx + player.speedPerFrame < 0){
            player.vx += player.speedPerFrame;
        } else if (player.vx - player.speedPerFrame > 0){
            player.vx -= player.speedPerFrame;
        } else {
            player.vx = 0;
        }
    }
    checkCollision();
}


function checkCollision() {
    // Get any potential collisions (this quickly rules out walls that have no chance of colliding with the collPlayer)

    collPlayer.x = player.x + player.vx;
    collPlayer.y = player.y + player.vy;
    console.log(collPlayer.x);
    
    collision.update();
    const collPotentials = collPlayer.potentials();
    let collided = false;

    // Loop through the potential wall collisions
    for(const wall of collPotentials) {
        // Test if the collPlayer collides with the wall
        if(collPlayer.collides(wall, collResult)) {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',  collResult, collResult.overlap_x);
            collided = true;
            
            if (collResult.overlap_x == -1){
                console.log( collResult.overlap);
                // player.x = Math.round(player.x + collResult.overlap - 1);
                return 'left';
            }
            if (collResult.overlap_x == 1){
                console.log( collResult.overlap);
                
                // player.x = Math.round(player.x - collResult.overlap + 1);
                return 'right';
            }
            
            // Push the collPlayer out of the wall
            player.vx = 0;
            player.vx = 0;
        }
    }
    if (!collided){
        console.log('moving');
        
        player.x += player.vx;
        player.y += player.vy;
    }
    
    
}

function xChanged() {
    if (player.x !== player.prevX){
        return false;
    } else {
        return true
    }
}
function yChanged() {
    if (player.y !== player.prevY){
        return false;
    } else {
        return true
    }
}

function setPlayer() {
    player = new PIXI.Sprite(
        PIXI.loader.resources['player'].texture
    );
    player.position.set(350,800);
    player.maxSpeed = 10;
    player.vx = 0;
    player.vy = 5;
    player.gravity = 0.5;
    player.yMomentum = 0;
    player.jumpHeight = 15;
    player.speedPerFrameOnTheGround = player.maxSpeed/7;
    player.speedPerFrameInTheAir = player.maxSpeed/15;
    player.speedPerFrameFalling = player.maxSpeed/35;
    player.speedPerFrame = player.speedPerFrameOnTheGround;

    app.stage.addChild(player);
    playerMoveInit();
}

function playerMoveInit(){
    let left = keyboard('ArrowLeft'),
        right = keyboard('ArrowRight'),
        up = keyboard('ArrowUp');

    left.press = () => {
        playerMoves.left();
    };
    left.release = () => {
        if (!right.isDown) {
            playerMoves.stop();
        } else {
            playerMoves.right();
        }
    };
    up.press = () => {
        if (!player.jump){
            player.jump = true;
        }
    };
    right.press = () => {
        playerMoves.right();
    };
    right.release = () => {
        if (!left.isDown) {
            playerMoves.stop();
        } else {
            playerMoves.left();
        }
    };
}

function changeVelocity(intensity, changeTo, velocityVector = 'vx'){
    if (player[velocityVector] < changeTo){
        player[velocityVector] += intensity;
    } else {
        player[velocityVector] -= intensity;
    }
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

function Player(x, y) {
    this.x = x;
}

// Keyboard -------------------------------------------------

function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
      if (event.key === key.value) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
  
    //The `upHandler`
    key.upHandler = event => {
      if (event.key === key.value) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener(
      "keydown", downListener, false
    );
    window.addEventListener(
      "keyup", upListener, false
    );
    
    // Detach event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
}

// Keyboard END -------------------------------------------------