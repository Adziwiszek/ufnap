import WorldScene from './WorldScene.js';
import {addTeleporter} from './../SceneTeleporter.js';
import sessionManager from '../SessionManager.js';

class TestLobbyScene extends WorldScene {
    constructor () {
       super({key: 'TestLobbyScene'});
       TestLobbyScene.instance = this;
    }

    preload() {
        super.preload();
        
        this.load.image('grass_tileset', '/assets/grassTileset.png');
    }

    initPlayer(message) {
        this.myID = message.id;
        this.addNewPlayer(message.x, message.y, message.id);
        this.focusCamera(message.id);
    }

    updatePlayerPosition(message) {
        const player = this.players[message.id];
        player.setPosition(message.x, message.y);
    }

    create() {
        super.create();

        sessionManager.on('initMessage', this.initPlayer.bind(this));

        sessionManager.on('playerMoved', this.updatePlayerPosition.bind(this));

        sessionManager.on('newPlayer', (message) => {
            console.log('new player joined!');
            console.log(`player id = ${message.id}`);
            this.addNewPlayer(message.x, message.y, message.id);
        });

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

        // creating test teleporter
        this.houseTeleporter = addTeleporter(
            this, 
            () => { 
                sessionManager.removeAllListeners('initMessage');
                sessionManager.removeAllListeners('playerMoved');
                sessionManager.emit('changeRoom', { newRoom: 'HouseScene'});
                this.scene.start('HouseScene', { sm: this.sessionManager }); 
            }, 
            {x: 400, y: 400}
        );
        this.physics.add.collider(
            this.houseTeleporter.sprite,
            this.players[this.myID].sprite,
            this.houseTeleporter.callback
        );
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export default TestLobbyScene;