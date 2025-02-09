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
        this.activePlayersID = [];
        this.gameCells = {};

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

        sessionManager.on('gameStart', (data) => {
            console.log('game started!');
            console.log(data);
        });

        this.lobbyteleport = this.addTeleporterToScene(0, 0, 
            'TestLobbyScene', this.myID);

        const joinGameButton = this.createRoundedButton(700, 200, () => { 
                sessionManager.emit('joinGameQueue', {});
            }, 
            "Join game!", 
            { 
                fontSize: '24px', 
                fill: '#000000', 
                backgroundColor: '#00FF00', 
            }
        );

        const leaveGameButton = this.createRoundedButton(700, 270, () => { 
                sessionManager.emit('leaveGameQueue', {});
            }, 
            "Leave game:(", 
            { 
                fontSize: '24px', 
                fill: '#000000', 
                backgroundColor: '#FF0000', 
            }
        );

        for(let i = 0; i < 9; i++) {
            const x = 300 + (i % 3) * 32;
            const y = 100 + Math.floor(i / 3) * 32;
            this.addGameCell(i, x, y);
        }
    }

    addGameCell(id, x, y) {
        const cell = new InteractiveObject()
            .setSprite(this.createSprite('emptyCell'))
            .setPosition(x, y)
            .setCallback(() => { 
                sessionManager.emit('tictactoemove', {cellid: id});
             })
            .makeInteractive();
        sessionManager.on('tictactoeresponse', (data) => {
            const newSymbol = data[id];
            cell.setSprite(this.createSprite(newSymbol));
        });
        this.gameCells[id] = cell;
    }

    update() {
        // update from WorldScene handles player movement
        super.update();
    }
}

export { TicTacToeScene };