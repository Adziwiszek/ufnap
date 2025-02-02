// import socket from './../socket.js';
import WorldScene from './WorldScene.js';

class HouseScene extends WorldScene {
    constructor () {
       super({key: 'HouseScene'});
       HouseScene.instance = this;
    }

    preload() {
        super.preload();
        
        this.load.image('grass_tileset', '/assets/pinkGrassTileset.png');
    }

    create() {
        super.create();

        this.waitForId().then(() => {
            this.initializeScene();
        });
        // this.initSocketEvents();
    }

    initializeScene() {
        console.log('initializing house...');
        this.cameras.main.setZoom(1.4);

        // todo fix text bubble showing under tile map
        const map = this.make.tilemap({ width: 224, height: 224, tileWidth: 32, tileHeight: 32 });
        const tiles = map.addTilesetImage('grass_tileset', null, 32, 32);
        
        const layer = map.createBlankLayer('layer1', tiles);
        layer.randomize(0, 0, map.width, map.height, [ 0, 1 ]);
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export default HouseScene;