// import socket from '/socket.js';
import BootScene from './Scenes/BootScene.js';
//import WorldScene from './Scenes/WorldScene.js';
import TestLobbyScene from './Scenes/TestLobbyScene.js';

const config = {
    // eslint-disable-next-line no-undef
    type: Phaser.AUTO,
    width: 1152,
    height: 704,
    scene: [BootScene, TestLobbyScene],
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