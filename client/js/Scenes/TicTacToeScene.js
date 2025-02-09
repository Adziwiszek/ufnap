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

        sessionManager.on('gameEnd', (data) => {
            const resultText = data.result;
            const endGameButton = this.createRoundedButton(600, 400, () => { 
                    endGameButton.destroy();
                    this.player2.destroy();
                    this.player1.destroy(); 
                    this.currentPlayer.destroy();
                    for(let i = 0; i < 9; i++) {
                        this.gameCells[i].setSprite(this.createSprite('emptyCell'));
                    }
                    sessionManager.emit('quitGame', {});
                }, 
                resultText, 
                { 
                    fontSize: '32px', 
                    fill: '#000000', 
                    backgroundColor: '#FFFFFF', 
                }
            );
        });

        sessionManager.on('gameStart', (data) => {
            console.log('game started!');
            console.log(data);

            // player symbols are messed up
            this.gameData = data;
            this.player1 = this.add.text(20, 300,
             `1) ${data.player2.symbol} - ${data.player1.name}`, 
             {
                fontSize: '24px', 
                fill: '#000000', 
                backgroundColor: '#DDDDDD',
            });
            this.player2 = this.add.text(20, 350, 
            `2) ${data.player1.symbol} - ${data.player2.name}`,
             {
                fontSize: '24px', 
                fill: '#000000', 
                backgroundColor: '#FFFFFF',
            });
            this.currentPlayer = this.add.text(
                400, 
                20, 
                data.player1.id == this.myID ? 'your turn!' : 'opponents turn!', 
                {
                fontSize: '24px',
                fill: '#000000',
                backgroundColor: '#FFFFFF',
            });

            if(this.inQueueText) {
                this.inQueueText.destroy();
                delete this.inQueueText;
            }
        });

        sessionManager.on('leftQueue', (data) => {
            if(this.inQueueText) {
                console.log('left the queue!');
                this.inQueueText.destroy();
                delete this.inQueueText;
            }
        });

        sessionManager.on('addedToTheQueue', (data) => {
            console.log('added to the queue!');
            this.inQueueText = this.add.text(400, 20, 'Waiting for opponent...', {
                fontSize: '24px', 
                fill: '#000000', 
                backgroundColor: '#FFFFFF',
            });
        });

        sessionManager.on('tictactoeresponse', (data) => {
            if(this.currentPlayer) {
                if(data.currentPlayerId == this.myID) {
                    this.currentPlayer.text = 'your turn!';
                } else {
                    this.currentPlayer.text = 'opponents turn!';
                }
            }
        });

        this.lobbyteleport = this.addTeleporterToScene(0, 0, 
            'TestLobbyScene', this.myID);

        const joinGameButton = this.createRoundedButton(700, 200, () => { 
                console.log(`player ${this.myID} joined game`);
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
                this.destroyGameUI();
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

    destroyGameUI(){
        if(this.player2) this.player2.destroy();
        if(this.player1) this.player1.destroy(); 
        if(this.currentPlayer) this.currentPlayer.destroy();
        for(let i = 0; i < 9; i++) {
            this.gameCells[i].setSprite(this.createSprite('emptyCell'));
        }
        sessionManager.emit('quitGame', {});
    }
}

export { TicTacToeScene };