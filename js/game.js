//Aliases
const Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle;

// const app = new Application({
//     width: 1920,
//     height: 1080,
//     resolution: 0.7
// });

var renderer = PIXI.autoDetectRenderer({
    width: 1920,
    height: 1024,
    resolution: 1
});
document.body.appendChild(renderer.view);

// document.body.appendChild(app.view);

loader
    .add('/img/teamfun/tilemap.tmx')
    .on('progress', loaderProgress)
    .load(setup);

function setup(loader, resources) {
    let tileMap = new PIXI.extras.TiledMap('/img/teamfun/tilemap.tmx');
    renderer.render(tileMap);
}

function loaderProgress(loader, resource) {
    //Display the file `url` currently being loaded
    console.log("loading: " + resource.url); 

    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%"); 
}