import socket from './../socket.js';

const textBubbleLifeTime = 2000;

class Player {
    constructor(x, y, parentScene) {
        this.parentScene = parentScene;
        this.x = x;
        this.y = y;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.sprite.setPosition(x, y);
        if (this.text) {
            this.text.setPosition(x, y - 50);
        }
    }

    setSprite(sprite) {
        this.sprite = sprite;
    }

    showChatBubble(text) {
        if (this.text) {
            this.text.destroy();
        }
        this.text = text;
        this.text.setPosition(this.x, this.y);
        setTimeout(() => {
            if (this.text.getData('id') == text.getData('id')) {
                this.text.destroy();
            }
        }, textBubbleLifeTime);
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
        this.msgCounter = 0;
        this.myID = null; 

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

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
    }

    createPlayerSprite(tint=0xf24f44, x=200, y=200) {
        let newPlayer = this.physics.add
            .sprite(x, y, 'player')
        newPlayer.setScale(0.1);
        newPlayer.setTint(tint);
        newPlayer.setCollideWorldBounds(true);
        return newPlayer;
    }

    addNewPlayer(x, y, id) {
        let p = new Player(x, y, this);
        let tint = id === this.myID ? 0x4287f5 : 0xff9c66;
        p.setSprite(this.createPlayerSprite(
            tint,
            x,
            y
        ));
        this.players[id] = p;
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
                this.myID = message.id;
                this.addNewPlayer(message.x, message.y, this.myID);
                this.focusCamera(this.myID);
            }
            if(message.worldHeight && message.worldWidth) {
                this.updateWorldSize(
                    message.worldHeight,
                    message.worldWidth
                );
            }
        });

        socket.on('currentPlayers', (players) => {
            for(let id in players) {
                this.addNewPlayer(
                    players[id].x,
                    players[id].y,
                    id
                );
            }
        }); 
        
        socket.on('update players', (serverPlayers) => {
            for(let id in serverPlayers) {
                let x = serverPlayers[id].x;
                let y = serverPlayers[id].y;
                let p = this.players[id];
                if(p) {
                    p.setPosition(x, y);
                }
            }
        });
        
        socket.on('newPlayer', ({id, x, y}) => {
            console.log('new player!');
            this.addNewPlayer(x, y, id);
        });
            
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
            const player = this.players[id];
            if (player && player.sprite) {
                player.sprite.destroy();
            }
            delete this.players[id];
        });

        socket.on('chatMessage', (message) => {
            let sender = this.players[message.id];
            if (sender) {
                let text = this.add.text(
                    0, 0, 
                    message.data, 
                    { 
                        font: '"Press Start 2P"',
                    }
                );
                // text.setFontSize(32);
                text.setData('id', this.msgCounter++);
                sender.showChatBubble(text);
            }
        });
    }
}

export default WorldScene;