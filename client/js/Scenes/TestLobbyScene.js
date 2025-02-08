import WorldScene from './WorldScene.js';
import sessionManager from '../SessionManager.js';
import InteractiveObject from '../InteractiveObject.js';

class TestLobbyScene extends WorldScene {
    constructor () {
       super({key: 'TestLobbyScene'});
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();

        // this.initSocketEvents();
        sessionManager.waitForId().then(() => {
            this.initializeScene();
        });
    }

    initializeScene() {
        this.cameras.main.setZoom(1.4);

        const map = this.make.tilemap({ 
            width: 224, 
            height: 224, 
            tileWidth: 32, 
            tileHeight: 32 
        });
        const tiles = map.addTilesetImage('grass_tileset', null, 32, 32);
        
        const layer = map.createBlankLayer('layer1', tiles);
        layer.randomize(0, 0, map.width, map.height, [ 0, 1]);

        this.houseTeleporter = this.addTeleporterToScene(400, 400, 'HouseScene', this.myID);


        const testsprite = this.physics.add.sprite(300, 20, 'player');
        this.testinter = new InteractiveObject(300, 20, testsprite);
        this.testinter.addServerEventSender('dupa', { pid: this.myID });
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export default TestLobbyScene;