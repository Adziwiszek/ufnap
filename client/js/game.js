// import socket from '/socket.js';
import BootScene from './Scenes/BootScene.js';
import WorldScene from './Scenes/WorldScene.js';

const config = {
    // eslint-disable-next-line no-undef
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    scene: [BootScene, WorldScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    parent: 'gameCanvas',
};

// eslint-disable-next-line no-unused-vars, no-undef
const game = new Phaser.Game(config);