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
    
    graphics2.beginFill(0xfff012,1);
    graphics2.drawPolygon([0,0, 78,0, 78,78, 0,78]);
    graphics2.endFill();
    app.stage.addChild(graphics2);

    var graphics = new PIXI.Graphics();
    // set a fill color and an opacity
    graphics.beginFill(0xfff012,1);
    // draw a rectangle using the arguments as:  x, y, radius
    graphics.drawPolygon([350,850, 425,700, 700,850, 425,900]);
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
    // jump
    if (player.jump){
        player.yMomentum += player.gravity;
        player.vy = -player.jumpHeight + player.yMomentum;
    } else {
        player.vy = 5;
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
    graphics2.x = collPlayer.x;
    graphics2.y = collPlayer.y;
    
    collision.update();
    const collPotentials = collPlayer.potentials();
    let yCollided = false;
    let xCollided = false;

    // Loop through the potential wall collisions
    for(const wall of collPotentials) {
        // Test if the collPlayer collides with the wall
        if(collPlayer.collides(wall, collResult)) {
            // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',  collResult, collResult.overlap_x);

            // Push the collPlayer out of the wall
            console.log('y ', collResult.overlap_y);
            console.log('!!!!!!!!!!!!!!collResult',collResult);
            if (Math.abs(collResult.overlap_x) != 0){
                xCollided = true;
            }
            if (1 - collResult.overlap_y < 1){
                yCollided = true;
                console.log('y 1');
                player.yMomentum = 0;
                player.vy = 0;
                player.jump = false;
            }
            if (1 - collResult.overlap_y > 1){
                yCollided = true;
                console.log('y -1');
                
                // player.yMomentum
            }
            console.log(collResult.overlap_x, collResult.overlap_y);
            
        }
    }
    
    if (!xCollided){
        // console.log('movingX');
        player.x += player.vx;
    }
    if (!yCollided){
        // console.log('movingY');
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
    player.position.set(350,500);
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
        up = keyboard('ArrowUp'),
        down = keyboard('ArrowDown');

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
    // left.press = () => {
    //     player.vx = -5;
    //     player.vy = 0;
    // };
    // left.release = () => {
    //     if (!right.isDown && player.vy === 0) {
    //         player.vx = 0;
    //     }
    // };
    // up.press = () => {
    //     player.vy = -5;
    //     player.vx = 0;
    // };
    // up.release = () => {
    //     if (!down.isDown && player.vx === 0) {
    //         player.vy = 0;
    //     }
    // };
    // right.press = () => {
    //     player.vx = 5;
    //     player.vy = 0;
    // };
    // right.release = () => {
    //     if (!left.isDown && player.vy === 0) {
    //         player.vx = 0;
    //     }
    // };
    // down.press = () => {
    //     player.vy = 5;
    //     player.vx = 0;
    // };
    // down.release = () => {
    //     if (!up.isDown && player.vx === 0) {
    //         player.vy = 0;
    //     }
    // };
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