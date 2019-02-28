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
parseTileMap('/img/teamfun/tilemapjsontestcsv.json');


 
document.body.appendChild(app.view);

function setup() {
    // setBackground();
    tilemap.draw();
    setPlayer();
    app.ticker.add(delta => update(delta));
}
console.log('height----------',app.renderer.height);

function update(delta) {
    if (player.y+player.height + player.vy > app.renderer.height){
        player.vy = 0;
        player.y = app.renderer.height - player.height;
        player.jump = false;
        player.gravity = 0;
        player.jumpHeight = 15;
    }
    // jump
    if (player.jump){
        player.gravity += 0.5;
        player.vy = -player.jumpHeight + player.gravity;
    }
    player.x += player.vx;
    player.y += player.vy;
}

function setPlayer() {
    player = new PIXI.Sprite(
        PIXI.loader.resources['player'].texture
    );
    player.position.set(150,800);
    player.vx = 0;
    player.vy = 5;
    player.gravity = 0;

    app.stage.addChild(player);
    playerMove();
}

function playerMove(){
    let left = keyboard('ArrowLeft'),
        right = keyboard('ArrowRight'),
        up = keyboard('ArrowUp');
        speed = 5;
    left.press = () => {
        if (!right.isDown){
            player.vx = -speed;
        }
    };
    left.release = () => {
        if (!right.isDown) {
            player.vx = 0;
        }
    };
    up.press = () => {
        if (!player.jump){
            player.jump = true;
        }
    };
    right.press = () => {
        if (!left.isDown){
            player.vx = speed;
        } else {
            player.vx = 0; 
        }
    };
    right.release = () => {
        if (!left.isDown) {
            player.vx = 0;
        }
    };
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
        // console.log('layers',tilemap.layers);
        // console.log('rows',tilemap.rows);
        // console.log('cols',tilemap.cols);
        // console.log('tile width',tilemap.tileWidth);
        // console.log('tile height',tilemap.tileHeight);
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
                    // console.log({
                    //     index: index + 1,
                    //     tilenumber: tile,
                    //     rownNumber: rowNumber
                    // });
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