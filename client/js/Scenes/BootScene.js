// import socket from './../socket.js';

// eslint-disable-next-line no-undef
class BootScene extends Phaser.Scene
{
    constructor () {
        super('BootScene');
    }

    preload ()
    {
        // this.load.setBaseURL('https://labs.phaser.io');
        this.load.image('player', '/assets/player.png');
        this.load.image('teleporter', '/assets/teleporter.png');
        this.load.image('pink_grass_tileset', '/assets/pinkGrassTileset.png');
        this.load.image('grass_tileset', '/assets/grassTileset.png');
        this.load.image('emptyCell', '/assets/emptyCell.png');
        this.load.image('XCell', '/assets/XCell.png');
        this.load.image('OCell', '/assets/OCell.png');
    }

    create ()
    {
        this.scene.start('TestLobbyScene');
        // this.scene.start('HouseScene');
    }

    // update(time, dt) {
        
    // }
}

export default BootScene;