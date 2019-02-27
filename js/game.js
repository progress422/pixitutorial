//Aliases
const Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle;

const app = new Application({
    width: 1920,
    height: 1080,
    resolution: 1
});

// var renderer = PIXI.autoDetectRenderer({
//     width: 1920,
//     height: 1024,
//     resolution: 1
// });
// document.body.appendChild(renderer.view);
parseTileMap('/img/teamfun/tilemapjsontestcsv.json');
// console.log(tilemap);
// console.log(tilemap.cols);
// console.log(tilemap.imagesArray);



document.body.appendChild(app.view);

function setup(loader, resources) {
    let sprite = new PIXI.Sprite(
       PIXI.loader.resources['tileimg1'].texture
    );
    app.stage.addChild(sprite);
}

function loaderProgress(loader, resource) {
    //Display the file `url` currently being loaded
    console.log("loading: " + resource.url); 

    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%"); 
}

function parseTileMap(tilemapSource){
    const tilemap = {}
    fetch(tilemapSource)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        tilemap.rows = data.height;
        tilemap.cols = data.width;
        tilemap.tileWidth = data.tilewidth;
        tilemap.tileHeight = data.tileheight;
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
        console.table(tilemap);
        let imagesArr = tilemap.loadTiles();
        tilemap.draw();
    });
    tilemap.loadTiles = function() {
        let tileImagesArr = [];
        let tilemapPrefix = 'tileimg';
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
        console.log(tileImagesArr);
        
        // load images to pixi
        tileImagesArr.map((img) => loader.add(img.alias, pathToImages + img.src));
        loader
            // .on('progress', loaderProgress)
            .load(setTilesOnMap(tileImagesArr.map((img) => img.alias)));
    }
    tilemap.draw = function() {
        this.layers.map((layer) => {
            console.log('layer',layer);
        })
    }
}

function setTilesOnMap(tilesAliasArr){
    console.log(tilesAliasArr);
    tilesAliasArr.map((imgAlias) => {
        let img = new PIXI.Sprite(
            PIXI.loader.resources[imgAlias].texture
        );
    })
    // app.stage.addChild(sprite);
}