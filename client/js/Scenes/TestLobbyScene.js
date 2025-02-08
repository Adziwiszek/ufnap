import WorldScene from './WorldScene.js';
//import {addTeleporter} from './../SceneTeleporter.js';
import sessionManager from '../SessionManager.js';

class TestLobbyScene extends WorldScene {
    constructor () {
       super({key: 'TestLobbyScene'});
       TestLobbyScene.instance = this;
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

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('ufnapTiles', 'tileset');


        // const backgroundLayer = map.createLayer('background', tileset, 0, 0);
        // backgroundLayer.setCollisionByProperty({ collidable: true });

        const wallLayer = map.createLayer('walls', tileset, 0, 0);
        wallLayer.setCollisionByProperty({ collidable: true });

        
        // this.physics.add.collider(this.players[this.myID].sprite, wallLayer, () => {
        //     console.log("Collision detected!");
        // }); 

        this.physics.add.collider(this.players[this.myID].sprite, wallLayer); 

        const debugGraphics = this.add.graphics();
        wallLayer.renderDebug(debugGraphics, {
            tileColor: null, 
            // eslint-disable-next-line no-undef
            collidingTileColor: new Phaser.Display.Color(255, 0, 0, 100), 
        });

        /*
        // creating test teleporter
        this.houseTeleporter = addTeleporter(
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
        );
        */
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export default TestLobbyScene;