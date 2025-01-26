import socket from './../socket.js';

const textBubbleLifeTime = 100000;
const bubbleTextPadding = {west: 10, east: 10, north:10, south: 10};

class Player {
    constructor(x, y, parentScene) {
        this.parentScene = parentScene;
        this.x = x;
        this.y = y;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if (this.sprite) {
            this.sprite.setPosition(x, y);
        }
        if (this.chatBubble) {
            // let bubbleBounds = this.chatBubble.bubble.getBounds();
            this.setChatBubblePosition(this.x, this.y);
        }
    }

    setSprite(sprite) {
        this.sprite = sprite;
    }

    setChatBubblePosition(x, y) {
        let contentBounds = this.chatBubble.content.getBounds();
        let playerBounds = this.sprite.getBounds();
        this.chatBubble.bubble.setPosition(x, y - (playerBounds.height/2) - this.chatBubble.bubbleHeight);
        this.chatBubble.content.setPosition(
            x + bubbleTextPadding.west,
            y - (playerBounds.height/2) - this.chatBubble.bubbleHeight + bubbleTextPadding.north
        );
    }

    showChatBubble(chatBubble) {
        if (this.chatBubble) {
            this.chatBubble.bubble.destroy();
            this.chatBubble.content.destroy();
        }
        this.chatBubble = chatBubble;
        this.setChatBubblePosition(this.x, this.y);
        setTimeout(() => {
            if (this.chatBubble.id == chatBubble.id) {
                this.chatBubble.bubble.destroy();
                this.chatBubble.content.destroy();
                
                delete this.chatBubble;
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

    update() {
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

    /**
     * Creates a chat bubble with a given text at a specified position.
     * 
     * @param {*} x - x coordinate
     * @param {*} y - y coordinate
     * @param {*} text - chat message
     * @returns {{bubble: Phaser.GameObjects.Graphics, content: Phaser.GameObjects.Text}} 
     * Returns background for chat bubble and text
     */
    createChatBubble(x, y, text) {
        let content = this.add.text(
            0, 0, text, 
            { 
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#000000',
                align: 'center',
                //wordWrap: { width: bubbleWidth - (bubblePadding * 2) } 
            }
        );
        let contentBounds = content.getBounds();
        
        let bubblePadding = 10;
        let bubbleWidth = contentBounds.width + 2 * bubblePadding;
        let bubbleHeight = contentBounds.height + 2 * bubblePadding;
        let arrowHeight = bubbleHeight / 4;
    
        let bubble = this.add.graphics({ x: x, y: y });
        //  Bubble shadow
        bubble.fillStyle(0x222222, 0.5);
        bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);
    
        //  Bubble color
        bubble.fillStyle(0xffffff, 1);
    
        //  Bubble outline line style
        bubble.lineStyle(4, 0x565656, 1);
    
        //  Bubble shape and outline
        bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
        bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16)
        
        //  Calculate arrow coordinates
        var point1X = Math.floor(bubbleWidth / 7);
        var point1Y = bubbleHeight;
        var point2X = Math.floor((bubbleWidth / 7) * 2);
        var point2Y = bubbleHeight;
        var point3X = Math.floor(bubbleWidth / 7);
        var point3Y = Math.floor(bubbleHeight + arrowHeight);
    
        //  Bubble arrow shadow
        bubble.lineStyle(4, 0x222222, 0.5);
        bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);
    
        //  Bubble arrow fill
        bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
        bubble.lineStyle(2, 0x565656, 1);
        bubble.lineBetween(point2X, point2Y, point3X, point3Y);
        bubble.lineBetween(point1X, point1Y, point3X, point3Y);
    
        content.setPosition(
            bubble.x + (bubbleWidth - contentBounds.width) / 2,
            bubble.y + (bubbleHeight - contentBounds.height) / 2
        );
        bubble.setDepth(1000);
        content.setDepth(1001);
        return {bubble: bubble, content: content, bubbleHeight: bubbleHeight+arrowHeight, bubbleWidth: bubbleWidth};
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
        socket.emit('clientReady');
        socket.on('initMessage', (message) => {
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
        
        /*socket.on('update players', (serverPlayers) => {
            for(let id in serverPlayers) {
                let x = serverPlayers[id].x;
                let y = serverPlayers[id].y;
                let p = this.players[id];
                if(p) {
                    p.setPosition(x, y);
                }
            }
        });*/
        
        socket.on('newPlayer', ({id, x, y}) => {
            console.log('new player!');
            this.addNewPlayer(x, y, id);
        });
            
        socket.on('playerMoved', ({ id, x, y }) => {
            if (this.players[id]) {
                this.players[id].setPosition(x, y);
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
                const chatBubble =
                    this.createChatBubble(
                        sender.x,
                        sender.y,
                        message.data
                    );
                chatBubble.id = this.msgCounter++;
                sender.showChatBubble(chatBubble);
            }
        });
    }
}

export default WorldScene;