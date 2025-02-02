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
    }

    create ()
    {
        this.scene.start('TestLobbyScene');
    }

    // update(time, dt) {
        
    // }
}

export default BootScene;