import WorldScene from './WorldScene.js';
import sessionManager from '../SessionManager.js';
import {InteractiveObject} from '../InteractiveObject.js';

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

        this.createRandomBackgroundFromTileset(
            'grass_tileset', 
            2,
            this.worldWidth, 
            this.worldHeight
        );
        
        this.houseTeleporter = this.addTeleporterToScene(400, 400, 
            'HouseScene', this.myID, { outX: 100, outY: 100 });

        this.game1teleporter = this.addTeleporterToScene(400, 600, 
            'TicTacToeScene', this.myID);
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export default TestLobbyScene;