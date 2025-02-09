import WorldScene from './WorldScene.js';
import sessionManager from '../SessionManager.js';
import {InteractiveObject} from '../InteractiveObject.js';

class TicTacToeScene extends WorldScene {
    constructor () {
    super({key: 'TicTacToeScene'});
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

        this.lobbyteleport = this.addTeleporterToScene(0, 0, 
            'TestLobbyScene', this.myID);

        const s1 = new InteractiveObject()
            .setSprite(this.createSprite('emptyCell'))
            .setPosition(300, 100)
            .setCallback(() => { 
                s1.setSprite(this.createSprite('XCell'));
             })
            .makeInteractive();
        sessionManager.on('tictactoeresponse', (data) => {
            console.log('response received');
            console.log(data);
            s1.setSprite(this.createSprite('OCell'));
        });

        const s2 = new InteractiveObject()
            .setSprite(this.createSprite('XCell'))
            .setPosition(332, 100)
            .setCallback(() => { 
                console.log('clicked s2'); 
                sessionManager.emit('tictactoemove', {cellid: 2});
            })
            .makeInteractive();
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export { TicTacToeScene };