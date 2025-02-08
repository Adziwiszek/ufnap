import WorldScene from './WorldScene.js';
import sessionManager from '../SessionManager.js';

class HouseScene extends WorldScene {
    constructor () {
       super({key: 'HouseScene'});
    }

    init(data) {
        super.init(data);
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();

        sessionManager.waitForId().then(() => {
            this.initializeScene();
        });
    }

    initializeScene() {
        this.cameras.main.setZoom(1.4);

        const map = this.make.tilemap({ width: 224, height: 224, tileWidth: 32, tileHeight: 32 });
        const tiles = map.addTilesetImage('pink_grass_tileset', null, 32, 32);
        
        const layer = map.createBlankLayer('layer1', tiles);
        layer.randomize(0, 0, map.width, map.height, [ 0, 1 ]);

        this.lobbyTeleporter = this.addTeleporterToScene(600, 400, 'TestLobbyScene', this.myID);
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export default HouseScene;