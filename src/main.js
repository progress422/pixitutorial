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

const Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle;

const app = new Application({
    width: 1920,
    height: 1024,
    resolution: 0.7
});

const zoom = 1;

// app.stage.scale.x = zoom;
app.stage.scale.y = -1;

const tilemap = {};
let playerView;

// laod background
loader.add('background', '/img/teamfun/Background2.png')
.add('player', '/img/teamfun/player.png');

parseTileMap('/img/teamfun/tilemapjsontestcsv.json');

document.body.appendChild(app.view);

function init() {
    setBackground();
    tilemap.draw();
    setPlayer();


    // Init canvas
    canvas = document.getElementById("myCanvas");
    w = canvas.width;
    h = canvas.height;
    ctx = canvas.getContext("2d");
    ctx.lineWidth = 1 / zoom;

    // Init world
    world = new p2.World();

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
    var left = 0, right = 0;
    window.addEventListener('keydown', function (evt) {
        switch (evt.keyCode) {
            case 38: // up key
            case 32: player.setJumpKeyState(true); break; // space key
            case 39: right = 1; break; // right key
            case 37: left = 1; break; // left key
        }
        player.input[0] = right - left;
    });
    window.addEventListener('keyup', function (evt) {
        switch (evt.keyCode) {
            case 38: // up
            case 32: player.setJumpKeyState(false); break;
            case 39: right = 0; break;
            case 37: left = 0; break;
        }
        player.input[0] = right - left;
    });

    requestAnimationFrame(animate);
}

function setPlayer() {
    playerView = new PIXI.Sprite(
        PIXI.loader.resources['player'].texture
    );
    // playerView.position.set(350,-500);

    playerView.scale.y = -1;

    app.stage.addChild(playerView);
}

function setBackground() {
    let bg = new PIXI.Sprite(
        PIXI.loader.resources['background'].texture
    );
    app.stage.addChild(bg);
}

function addStaticPolygon(x, y, vertices) {
    var shape = new p2.Convex({
        collisionGroup: SCENERY_GROUP,
        vertices
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

function addWalls(){
    let horizontalTop = new p2.Body();
    horizontalTop.addShape(new p2.Plane());
    world.addBody(horizontalTop);

    let horizontalBottom = new p2.Body();
    horizontalBottom.addShape(new p2.Plane());
    horizontalBottom.position = [0,-970];
    // horizontalBottom.position = [0,-app.renderer.screen.height]
    world.addBody(horizontalBottom);
    

    let verticalLeft = new p2.Body({angle: Math.PI / 2});
    verticalLeft.addShape(new p2.Plane({collisionGroup: SCENERY_GROUP}));
    world.addBody(verticalLeft);
    
    let verticalRight = new p2.Body({angle: Math.PI / 2});
    verticalRight.addShape(new p2.Plane({collisionGroup: SCENERY_GROUP}));
    verticalRight.position = [app.renderer.screen.width,0]
    world.addBody(verticalRight);
}

function drawBody(body) {
    var x = body.interpolatedPosition[0],
        y = body.interpolatedPosition[1],
        s = body.shapes[0];
    ctx.save();
    ctx.translate(x, y);     // Translate to the center of the box
    ctx.rotate(body.interpolatedAngle);  // Rotate to the box body frame

    if (s instanceof p2.Box) {
        ctx.fillRect(-s.width / 2, -s.height / 2, s.width, s.height);
    } else if (s instanceof p2.Circle) {
        ctx.beginPath();
        ctx.arc(0, 0, s.radius, 0, 2 * Math.PI);
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
    ctx.translate(w / 2, h / 2);  // Translate to the center
    ctx.scale(zoom, -zoom);   // Zoom in and flip y axis

    p2.vec2.lerp(
        cameraPos,
        cameraPos,
        [-characterBody.interpolatedPosition[0], -characterBody.interpolatedPosition[1]],
        0.05
    );
    ctx.translate(
        cameraPos[0],
        cameraPos[1]
    );

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
        loader.load(init);
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
        tile.position.set(x,-(y-tile.height));
        tile.scale.y = -1;
        app.stage.addChild(tile);
    }
}