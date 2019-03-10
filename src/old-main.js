let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle;

let app = new Application({
  width: 256,
  height: 256,
  resolution: 1
});

document.body.appendChild(app.view);
app.renderer.autoResize = true;
app.renderer.resize(512, 512);

//load an image

loader
    .add([
        "../img/treasureHunter.json"
    ])
    .on("progress", loadProgressHandler)
    .load(setup);
//PIXI.loader.reset(); //reset loader

let explorer;

function setup() {
    let treasureHunter = PIXI.loader.resources["../img/treasureHunter.json"].textures;
    let dungeon = new Sprite(treasureHunter["dungeon.png"]),
        treasure = new Sprite(treasureHunter["treasure.png"]),
        door = new Sprite(treasureHunter["door.png"]);
    
    explorer = new Sprite(treasureHunter["explorer.png"]);

    let left = keyboard('ArrowLeft'),
    right = keyboard('ArrowRight'),
    up = keyboard('ArrowUp'),
    down = keyboard('ArrowDown');

    left.press = () => {
        explorer.vx = -5;
        explorer.vy = 0;
    };
    left.release = () => {
        if (!right.isDown && explorer.vy === 0) {
            explorer.vx = 0;
        }
    };
    up.press = () => {
        explorer.vy = -5;
        explorer.vx = 0;
    };
    up.release = () => {
        if (!down.isDown && explorer.vx === 0) {
            explorer.vy = 0;
        }
    };
    right.press = () => {
        explorer.vx = 5;
        explorer.vy = 0;
    };
    right.release = () => {
        if (!left.isDown && explorer.vy === 0) {
            explorer.vx = 0;
        }
    };
    down.press = () => {
        explorer.vy = 5;
        explorer.vx = 0;
    };
    down.release = () => {
        if (!up.isDown && explorer.vx === 0) {
            explorer.vy = 0;
        }
    };
        
    //dungeon
    app.stage.addChild(dungeon);
    //explorer
    explorer.x = 68;
    explorer.y = app.stage.height / 2 - explorer.height / 2;
    explorer.vx = 0;
    explorer.vy = 0;
    app.stage.addChild(explorer);
    //treasure
    treasure.x = app.stage.width - treasure.width - 48;
    treasure.y = app.stage.height / 2 - treasure.height / 2;
    app.stage.addChild(treasure);
    //door
    door.position.set(32, 0);
    app.stage.addChild(door);
    //blobs
    let numberOfBlobs = 8,
        dungeonBorderWidth = 32,
        blobsPositions = {width: [], height: []};
    for (let i = 0; i < numberOfBlobs; i++) {
        let blob = new Sprite(treasureHunter["blob.png"]);
        
        blob.x = Math.floor(Math.random()*(app.renderer.width - dungeonBorderWidth*2 - blob.width)) + dungeonBorderWidth;
        blob.x = preventImageOnImage(blobsPositions.width, blob.x, blob.width, app.renderer.width, 10);
        console.log('x',blob.x);
        
        blobsPositions.width.push(blob.x);
        console.log('positions',blobsPositions.width);
        
        blob.y = Math.floor(Math.random()*(app.renderer.height - dungeonBorderWidth*2 - blob.height)) + dungeonBorderWidth;
        blob.y = preventImageOnImage(blobsPositions.height, blob.y, blob.height, app.renderer.height, 10);
        blobsPositions.height.push(blob.y);
        app.stage.addChild(blob);
    }

    //-----------------------------------------------------------------------

    // let cat = new PIXI.Sprite(PIXI.loader.resources["../img/cat.png"].texture);
    // cat.position.set(160,160);
    // cat.rotation = 0.5;
    // set rotation point at the center
    // cat.anchor.set(0.5, 0.5);
    // ritation point in px
    // cat.pivot.set(32, 32);
    // cat2.scale.set(0.1, 0.1);
    // app.stage.addChild(cat);
    // cat.visible = false;

    // app.renderer.render(app.stage);
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    explorer.x += explorer.vx;
    explorer.y += explorer.vy;
}

function preventImageOnImage(placedObjects, objectPosition, objSize, canvasSize, padding, directionPositive = false) {
    console.log('----------------------------');
    
    let possiblePosition;
    let varDirectionPositive = directionPositive;
    placedObjects.forEach(arrElPos => {
        console.log(arrElPos);
        console.log(placedObjects);
        
        
        if (Math.abs(arrElPos - objectPosition) <= objSize){ //objects are too close
            console.log('too close');
            
            if (varDirectionPositive || objectPosition < canvasSize/2){ //set new position direction so object won't be out of the canvas
                possiblePosition = arrElPos + objSize + padding;
                varDirectionPositive = true;
            } else {
                possiblePosition = arrElPos - objSize - padding;
                varDirectionPositive = false;
            }
            console.log('possible position', possiblePosition);
            
            // preventImageOnImage(placedObjects, objectPosition, objSize, canvasSize, padding, varDirectionPositive);
        } else {
            console.log('return and go on =>');
            
            return objectPosition;
        }
    });
    return objectPosition;
}

function loadProgressHandler(loader, resource) {
    //Display the file `url` currently being loaded
    console.log("loading: " + resource.url); 

    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%"); 
}

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