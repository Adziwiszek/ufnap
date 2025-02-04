import {Player, bubbleTextPadding} from './../player.js';
import sessionManager from './../SessionManager.js';

const maxTextRow = 20;

// eslint-disable-next-line no-undef
class WorldScene extends Phaser.Scene {
/**
 * WorldScene is a template class for other scenes.
 * It has basic functionalities, like moving player in update(),
 * adding players etc.
 */
    constructor ({key: sceneName}) {
        super({key: sceneName});
        this.idReadyPromise = new Promise((resolve) => {
            this.resolveIdPromise = resolve;
        })
    }

    preload ()
    {

    }

    create () {
        this.players = {};
        this.myID = null; 
        this.messages = {};

        this.worldWidth = 1024;
        this.worldHeight = 1024;
        this.msgCounter = 0;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        sessionManager.connect(this.scene.key);

        // this.initSocketEvents();
        sessionManager.on('initMessage', this.initPlayer.bind(this));
        sessionManager.on('playerMoved', this.updatePlayerPosition.bind(this));
        sessionManager.on('newPlayer', this.handleAddingNewPlayer.bind(this));
        sessionManager.on('currentPlayers', this.handleAddingExistingPlayers.bind(this));
        sessionManager.on('chatMessage', this.handlePlayerMessage.bind(this));
        sessionManager.on('playerDisconnected', this.handlePlayerDisconnected.bind(this));

        this.coom = 42;
    }

    update() {
        if (this.cursors.left.isDown) {
            sessionManager.emit('move', 'left');
        } else if (this.cursors.right.isDown) {
            sessionManager.emit('move', 'right');
        }

        if (this.cursors.up.isDown) {
            sessionManager.emit('move', 'up');
        } else if (this.cursors.down.isDown) {
            sessionManager.emit('move', 'down');
        }
    }

    /**
     * Creates a new sprite for a player on a given position
     * 
     * @param {number} tint - color that the player sprite will be colored with
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @returns {sprite: Phaser.GameObjects.Sprite}
     * Player sprite
     */
    createPlayerSprite(tint=0xf24f44, x=200, y=200) {
        if (!this.physics || !this.physics.add) {
            console.error('Physics system is not initialized!');
            console.error(this.physics.add)
            return;
        }     

        let newPlayer = this.physics.add
            .sprite(x, y, 'player')
        newPlayer.setScale(0.1);
        newPlayer.setTint(tint);
        newPlayer.setCollideWorldBounds(true);
        return newPlayer;
    }

    /**
     * Adds new player to the scene
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} id 
     */
    addNewPlayer(x, y, id) {
        let p = new Player(x, y, this);
        let tint = id === this.myID ? 0x4287f5 : 0xff9c66;
        p.setSprite(this.createPlayerSprite(
            tint,
            x,
            y
        ));
        this.players[id] = p;
        this.players[id].sprite.setDepth(1000);
    }

    /**
     * Creates a chat bubble with a given text at a specified position.
     * 
     * @param {*} x - x coordinate
     * @param {*} y - y coordinate
     * @param {*} text - chat message
     * @returns {{bubble: Phaser.GameObjects.Graphics, content: Phaser.GameObjects.Text,
     *            bubbleHeight: number, bubbleWidth: number}} 
     * Returns background for chat bubble and text
     */
    createChatBubble(x, y, text) {
        const textRows = [];
        const words = text.split(/\s+/);
        let currentRow = [];
        words.forEach(word => {
            currentRow.push(word);
            let rowLen = currentRow.reduce((acc, w) => acc + w.length, 0);
            if (rowLen >= maxTextRow) {
                textRows.push(currentRow.join(" "));
                currentRow = [];
            }
        });
        if(currentRow.length > 0) textRows.push(currentRow.join(" "));

        let content = this.add.text(
            0, 0, textRows, 
            { 
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#000000',
                align: 'center',
                //wordWrap: { width: bubbleWidth - (bubblePadding * 2) } 
            }
        );
        let contentBounds = content.getBounds();
        
        let bubbleWidth = contentBounds.width + bubbleTextPadding.west + bubbleTextPadding.east;
        let bubbleHeight = contentBounds.height + bubbleTextPadding.north + bubbleTextPadding.south;
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
    
    /**
     * Focuses camera on a player with given id
     * 
     * @param {number} id 
     */
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

    /**
     * Updates world size for the client
     * 
     * @param {number} height 
     * @param {number} width 
     */
    updateWorldSize(height, width) {
        this.worldHeight = height;
        this.worldWidth = width;
        this.cameras.main.setBounds(0, 0, 
            this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, 
            this.worldWidth, this.worldHeight);
    }

    waitForId() {
        return this.idReadyPromise;
    }

    initPlayer(message) {
        this.myID = message.id;
        this.addNewPlayer(message.x, message.y, message.id);
        this.focusCamera(message.id);
    }

    updatePlayerPosition(message) {
        const player = this.players[message.id];
        player.setPosition(message.x, message.y);
    }

    handlePlayerMessage(message) {
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
    }

    handleAddingExistingPlayers(players) {
        for(let id in players) {
            console.log('adding a player');
            this.addNewPlayer(
                players[id].x,
                players[id].y,
                id
            );
        }
    }

    handleAddingNewPlayer(message) {
        if(this.players[message.id]) {
            return;
        }
        console.log('new player joined!');
        console.log(`player id = ${message.id}`);
        this.addNewPlayer(message.x, message.y, message.id);
    }

    handlePlayerDisconnected(message) {
        console.log('player disconnected!');
        const id = message.id;
        this.deletePlayer(id);
    }

    deletePlayer(id) {
        const player = this.players[id];
        if (player && player.sprite) {
            player.sprite.destroy();
        }
        delete this.players[id];
    }
}

export default WorldScene;