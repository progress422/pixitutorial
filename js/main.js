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
app.renderer.resize(600, 600);

//load an image

loader
    .add([
        "../img/icon.png",
        "../img/cat.png",
        "../img/tileset.png"
    ])
    .on("progress", loadProgressHandler)
    .load(setup);
//PIXI.loader.reset(); //reset loader

function loadProgressHandler(loader, resource) {
    //Display the file `url` currently being loaded
    console.log("loading: " + resource.url); 

    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%"); 
}

function setup() {
    let texture = TextureCache["../img/tileset.png"];
    let rectangle = new Rectangle(192, 128, 64, 64);
    texture.frame = rectangle;
    let rocket = new Sprite(texture);
    app.stage.addChild(rocket);

    //-----------------------------------------------------------------------

    let cat = new PIXI.Sprite(PIXI.loader.resources["../img/cat.png"].texture);
    let cat2 = new PIXI.Sprite(PIXI.loader.resources["../img/icon.png"].texture);

    cat.position.set(160,160);
    cat.rotation = 0.5;

    // set rotation point at the center
    // cat.anchor.set(0.5, 0.5);
    //ritation point in px
    cat.pivot.set(32, 32);

    cat2.scale.set(0.1, 0.1);
    
    app.stage.addChild(cat);
    // app.stage.addChild(cat2);
//   app.stage.addChild(cat2);
//   cat.visible = false;

    app.renderer.render(app.stage);
}
