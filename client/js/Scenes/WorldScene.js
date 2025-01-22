import socket from './../socket.js';

const worldWidth = 1000;
const worldHeight = 1000;

class WorldScene extends Phaser.Scene {
    player;

    constructor () {
       super('WorldScene');
       WorldScene.instance = this;
    }

    preload ()
    {

    }

    create () {
        this.players = {};
        this.playersSprites = {};
        this.myID = null; 

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        this.initSocketEvents();
    }

    update(time, dt) {
        if (this.cursors.left.isDown) {
            socket.emit('move', 'left');
        } else if (this.cursors.right.isDown) {
            socket.emit('move', 'right');
        }

        if (this.cursors.up.isDown) {
            socket.emit('move', 'up');
        } else if (this.cursors.down.isDown) {
            socket.emit('move', 'down');
        }
       
        for(let id in this.players) {
            const sp = this.playersSprites[id];
            const player = this.players[id];
            if(sp) {
                sp.setPosition(player.x, player.y);
            }
        }
    }

    addPlayer(tint=0xf24f44) {
        let newPlayer = this.physics.add
            .sprite(200, 200, 'player')
        newPlayer.setScale(0.1);
        newPlayer.setTint(tint);
        newPlayer.setCollideWorldBounds(true);
        return newPlayer;
    }

    focusCamera(id) {
        if (this.playersSprites[id]) {
            this.cameras.main.startFollow(this.playersSprites[id]);
            //this.cameras.main.setZoom(2);
            this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        } else {
            console.warn(`Sprite not found for player ${id}`);
        }
    }

    initSocketEvents() {
        socket.emit('client ready');
        socket.on('init message', (message) => {
            if(message.id) {
                console.log('welcome!');
                this.myID = message.id;
                this.playersSprites[this.myID] = this.addPlayer(0x7eb7ed);
                this.focusCamera(this.myID);
            }
        })
        
        socket.on('currentPlayers', (serverPlayers) => {
            // Clearing old players
            for(let id in this.players) {
                delete this.players[id];
            }
            // Reassigning new players from server
            for(let id in serverPlayers) {
                this.players[id] = {
                    x: serverPlayers.x,
                    y: serverPlayers.y
                };
                if (!this.playersSprites[id]) {
                    this.playersSprites[id] = this.addPlayer();
                }
            }
        });
        
        socket.on('update players', (serverPlayers) => {
            for(let id in serverPlayers) {
                if (!this.playersSprites[id]) {
                    this.playersSprites[id] = this.addPlayer();
                }
                this.players[id] = serverPlayers[id];
                this.playersSprites[id].setPosition(
                    this.players[id].x,
                    this.players[id].y
                );
            }
        });
        
        socket.on('newPlayer', (player) => {
            this.players[player.id] = { x: player.x, y: player.y};
            this.playersSprites[player.id] = this.addPlayer();
        });
        
        socket.on('playerMoved', ({ id, x, y }) => {
            if (this.players[id]) {
                this.players[id].x = x;
                this.players[id].y = y;
                const sprite = this.playersSprites[id];
                if (sprite) {
                    sprite.setPosition(x, y);
                } else {
                    console.warn(`Sprite not found for player ${id}`);
                }
            }
        });
        
        socket.on('playerDisconnected', (id) => {
            const sprite = this.playersSprites[id];
            if (sprite) {
                sprite.destroy();
            }
            delete this.players[id];
            delete this.playersSprites[id];
        });
    }
}

export default WorldScene;