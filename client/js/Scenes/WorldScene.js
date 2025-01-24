import socket from './../socket.js';

const textBubbleLifeTime = 2000;

class Player {
    constructor(x, y, parentScene) {
        this.parentScene = parentScene;
        this.x = x;
        this.y = y;
    }

    setSprite(sprite) {
        this.sprite = sprite;
    }

    showChatBubble(text) {
        this.text = text;
        setInterval(() => {
            text.setPosition(this.x, this.y);
        }, 100);
        setTimeout(() => {
            this.text.destroy();
        }, 2000);
    }
}

class WorldScene extends Phaser.Scene {
    constructor () {
       super('WorldScene');
       WorldScene.instance = this;
    }

    preload ()
    {

    }

    create () {
        this.worldWidth = 1000;
        this.worldHeight = 1000;
        this.players = {};
        this.playersSprites = {};
        this.myID = null; 

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        // let text = this.add.text(0, 0, 'Hello World', { font: '"Press Start 2P"' });
        // text.setPosition(300, 300);
        // setTimeout(() => {text.destroy();}, 2000);

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

    createPlayerSprite(tint=0xf24f44, x=200, y=200) {
        let newPlayer = this.physics.add
            .sprite(x, y, 'player')
        newPlayer.setScale(0.1);
        newPlayer.setTint(tint);
        newPlayer.setCollideWorldBounds(true);
        return newPlayer;
    }

    focusCamera(id) {
        if (this.players[id].sprite) {
            const sprite = this.players[id].sprite;
            this.cameras.main.startFollow(sprite);
            //this.cameras.main.setZoom(2);
            this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        } else {
            console.warn(`Sprite not found for player ${id}`);
        }
    }

    updateWorldSize(height, width) {
        this.worldHeight = height;
        this.worldWidth = width;
        this.cameras.main.setBounds(0, 0, 
            this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, 
            this.worldWidth, this.worldHeight);
    }

    initSocketEvents() {
        socket.emit('client ready');
        socket.on('init message', (message) => {
            if(message.id) {
                console.log(`x = ${message.x}, y = ${message.y}`);
                this.myID = message.id;
                let p = new Player(message.x, message.y, this);
                p.setSprite(this.createPlayerSprite(
                    0x4287f5,
                    message.x,
                    message.y
                ));
                this.players[message.id] = p;

                this.focusCamera(this.myID);
            }
            if(message.worldHeight && message.worldWidth) {
                this.updateWorldSize(
                    message.worldHeight,
                    message.worldWidth
                );
            }
        });
        
        /*socket.on('currentPlayers', (serverPlayers) => {
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
                    this.playersSprites[id] = this.createPlayerSprite();
                }
            }
        });*/
        
        /*socket.on('update players', (serverPlayers) => {
            for(let id in serverPlayers) {
                if (!this.playersSprites[id]) {
                    this.playersSprites[id] = this.createPlayerSprite();
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
            this.playersSprites[player.id] = this.createPlayerSprite();
        });*/
        
        socket.on('playerMoved', ({ id, x, y }) => {
            if (this.players[id]) {
                this.players[id].x = x;
                this.players[id].y = y;
                const sprite = this.players[id].sprite;
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

        socket.on('chat message', (data) => {
            console.log(data);
            let text = this.add.text(0, 0, data, { font: '"Press Start 2P"' });
            text.setPosition(300, 300);
            setTimeout(() => {text.destroy();}, 2000);
        });
    }
}

export default WorldScene;