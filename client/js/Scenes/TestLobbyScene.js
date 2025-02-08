import WorldScene from './WorldScene.js';
import sessionManager from '../SessionManager.js';

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
        // creating test teleporter
        /*this.houseTeleporter = addTeleporter(

            this, 
            () => { 
                this.handleSwitchingToNewScene('HouseScene');
            }, 
            {x: 400, y: 400}
        );
        this.physics.add.collider(
            this.houseTeleporter.sprite,
            this.players[this.myID].sprite,
            this.houseTeleporter.callback
        );*/
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export default TestLobbyScene;