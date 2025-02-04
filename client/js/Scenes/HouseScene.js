// import socket from './../socket.js';
import WorldScene from './WorldScene.js';
import sessionManager from '../SessionManager.js';
import { Player } from '../player.js';

function createPlayerSprite(scene, tint=0xf24f44, x=200, y=200) {
    console.log('dupaa');
    console.log(scene.key);
    if (!scene.physics || !scene.physics.add) {
        console.error('Physics system is not initialized!');
        console.error(scene.physics.add)
        return;
    }     

    let newPlayer = scene.physics.add
        .sprite(x, y, 'player')
    newPlayer.setScale(0.1);
    newPlayer.setTint(tint);
    newPlayer.setCollideWorldBounds(true);
    return newPlayer;
}

function addNewPlayer(scene, x, y, id) {
    let p = new Player(x, y, this);
    let tint = id === scene.myID ? 0x4287f5 : 0xff9c66;
    p.setSprite(createPlayerSprite(
        scene,
        tint,
        x,
        y
    ));
    scene.players[id] = p;
    scene.players[id].sprite.setDepth(1000);
}
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
        sessionManager.on('initMessage', (message) => {
            this.myID = message.id;
            addNewPlayer(this, message.x, message.y, message.id);
            this.focusCamera(message.id);
        });

        sessionManager.on('playerMoved', (message) => {
            if(this.players[message.id]) {
                this.players[message.id].setPosition(message.x, message.y);
            }
        });

        sessionManager.waitForId().then(() => {
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