// import socket from '/socket.js';
import BootScene from './Scenes/BootScene.js';
//import WorldScene from './Scenes/WorldScene.js';
import TestLobbyScene from './Scenes/TestLobbyScene.js';
import HouseScene from './Scenes/HouseScene.js';
import { TicTacToeScene } from './Scenes/TicTacToeScene.js';

const config = {
    // eslint-disable-next-line no-undef
    type: Phaser.AUTO,
    width: 1152,
    height: 704,
    scene: [
        BootScene, 
        TestLobbyScene, 
        HouseScene,
        TicTacToeScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    parent: 'gameCanvas',
    render: {
        antialias: true,  // Enable anti-aliasing
    },
};

// eslint-disable-next-line no-unused-vars, no-undef
const game = new Phaser.Game(config);