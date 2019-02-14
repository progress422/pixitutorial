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

function setup() {
    let treasureHunter = PIXI.loader.resources["../img/treasureHunter.json"].textures;
    let dungeon = new Sprite(treasureHunter["dungeon.png"]),
        treasure = new Sprite(treasureHunter["treasure.png"]),
        door = new Sprite(treasureHunter["door.png"]),
        explorer = new Sprite(treasureHunter["explorer.png"]);
    //dungeon
    app.stage.addChild(dungeon);
    //explorer
    explorer.x = 68;
    explorer.y = app.stage.height / 2 - explorer.height / 2;
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
        dungeonBorderWidth = 32;
    for (let i = 0; i < numberOfBlobs; i++) {
        let blob = new Sprite(treasureHunter["blob.png"]);
        
        // blob.x = 32;
        blob.x = Math.floor(Math.random()*(app.renderer.width - dungeonBorderWidth*2 - blob.width)) + dungeonBorderWidth;
        console.log(blob.x);
        blob.y = Math.random()*(512-32*2)+32;
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

    app.renderer.render(app.stage);
}

function loadProgressHandler(loader, resource) {
    //Display the file `url` currently being loaded
    console.log("loading: " + resource.url); 

    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%"); 
}