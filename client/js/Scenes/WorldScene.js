import {Player, bubbleTextPadding} from './../player.js';
import {addTeleporter} from './../SceneTeleporter.js';
import sessionManager from './../SessionManager.js';
import {InteractiveObject} from './../InteractiveObject.js';

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

    init(data) {
        this.myID = data.myID;
    }

    preload ()
    {

    }

    create () {
        if(!this.players) {
            this.players = {};
        }
        if(!this.myID) {
            this.myID = null; 
        }
        this.messages = {};

        this.objects = {};

        this.worldWidth = 1024;
        this.worldHeight = 1024;
        this.msgCounter = 0;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        sessionManager.connect(this.scene.key);

        sessionManager.on('initMessage', this.initPlayer.bind(this));
        sessionManager.on('playerMoved', this.updatePlayerPosition.bind(this));
        sessionManager.on('newPlayer', this.handleAddingNewPlayer.bind(this));
        sessionManager.on('currentPlayers', this.handleAddingExistingPlayers.bind(this));
        sessionManager.on('chatMessage', this.handlePlayerMessage.bind(this));
        sessionManager.on('playerDisconnected', this.handlePlayerDisconnected.bind(this));

        const sceneNameText = this.add.text(
            200, 
            100, 
            this.scene.key, 
            { 
                fontSize: '32px', 
                fill: '#000',
                backgroundColor: '#fff',
            },
        )
            .setDepth(3000)
            .setScrollFactor(0);
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

    createRandomBackgroundFromTileset(tilesetName, numberOfTiles, width, height) {
        width = width/32;
        height = height/32;
        const map = this.make.tilemap({ 
            width: width, 
            height: height, 
            tileWidth: 32, 
            tileHeight: 32 
        });
        const tiles = map.addTilesetImage(tilesetName, null, 32, 32);
        
        const layer = map.createBlankLayer('layer1', tiles);
        let range = (n) => {
            let arr = [];
            for(let i = 0; i < n; i++) {
                arr.push(i);
            }
            return arr;
        }
        layer.randomize(0, 0, map.width, map.height, range(numberOfTiles));
    }

    createSprite(spriteName, x=0, y=0) {
        const sprite = this.physics.add.sprite(x, y, spriteName);
        return sprite;
    }

    addInteractiveObject(
        x, y, 
        name, 
        color=0x0000ff) 
        {
        const obj = this.add.rectangle(x, y, 32, 32, color);
        this.objects[name] = interactiveObject;
    }

    addTeleporterToScene(x, y, newSceneName, playerid, {outX, outY}={}) {
        const teleporter = addTeleporter(
            this, 
            () => { 
                this.handleSwitchingToNewScene(newSceneName, outX, outY);
            }, 
            {x: x, y: y}
        );
        this.physics.add.collider(
            teleporter.sprite,
            this.players[playerid].sprite,
            teleporter.callback
        );
        return teleporter; 
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

    createNameText(x, y){
        return this.add.text(x, y + 30, "", {
            fontSize: "12px",
            color: '#000000',
            strokeThickness: 0.2,
            stroke: '#000000',
            backgroundColor: "rgba(0, 0, 0, 0)",
            padding: { left: 5, right: 5, top: 2, bottom: 2 },
        }).setOrigin(0.5);
    }

    /**
     * Adds new player to the scene
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} id 
     */
    addNewPlayer(x, y, id, name=null) {
        console.log(name, "imie!!!!!!");
        let p = new Player(x, y, this, name);
        let tint = id === this.myID ? 0x4287f5 : 0xff9c66;
        p.setSprite(this.createPlayerSprite(
            tint,
            x,
            y
        ));
        p.setNameText(this.createNameText(x, y));
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
        this.addNewPlayer(message.x, message.y, message.id, message.name);
        this.focusCamera(message.id);
        this.updateWorldSize(message.worldHeight, message.worldWidth); 
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
                    message.data,
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
                id,
                players[id].name
            );
        }
    }

    handleAddingNewPlayer(message) {
        if(this.players[message.id]) {
            return;
        }
        console.log('new player joined!');
        console.log(`player id = ${message.id}`);
        console.log(message);
        this.addNewPlayer(message.x, message.y, message.id, message.name);
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
        if (player && player.nameText){
            player.nameText.destroy();
        }
        delete this.players[id];
    }

    handleSwitchingToNewScene(sceneName, outX, outY) {
        for(let id in this.players) {
            this.deletePlayer(id);
        }

        sessionManager.removeAllListeners('initMessage');
        sessionManager.removeAllListeners('playerMoved');
        sessionManager.removeAllListeners('newPlayer');
        sessionManager.removeAllListeners('currentPlayers');
        sessionManager.removeAllListeners('chatMessage');
        sessionManager.removeAllListeners('playerDisconnected');
        sessionManager.removeAllListeners('changeRoom');

        sessionManager.emit('changeRoom', { newRoom: sceneName, outX: outX, outY: outY });
        sessionManager.resetIdPromise();

        this.scene.start(sceneName, { myID: this.myID }); 
    }

    createRoundedButton(x, y, callback, text, textOptions = {}) {
        // Create container to hold all button elements
        const container = this.add.container(x, y);
        container.setDepth(3000).setScrollFactor(0);

        // Default text options
        const defaultTextOptions = {
            color: '#000000',
            fontSize: '16px',
            backgroundColor: '#00FF00',  // Default background color
            ...textOptions
        };
        const backgroundColor = defaultTextOptions.backgroundColor;
        delete defaultTextOptions.backgroundColor; 

        // Create text
        const buttonText = this.add.text(0, 0, text, defaultTextOptions);
        buttonText.setOrigin(0.5);  // Center the text

        // Calculate button dimensions with padding
        const padding = 20;
        const width = buttonText.width + padding * 2;
        const height = buttonText.height + padding * 2;

        // Create shadow
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.3);  // Semi-transparent black
        shadow.fillRoundedRect(-width/2 + 4, -height/2 + 4, width, height, 10);
        if (shadow.postFX) {
            shadow.postFX.addBlur(0, 4, 4, 1, 0x000000, 0);
        }

        // Create button background using the provided backgroundColor
        const background = this.add.graphics();
        const baseColor = parseInt(backgroundColor.replace('#', ''), 16);
        background.fillStyle(baseColor, 1);
        background.fillRoundedRect(-width/2, -height/2, width, height, 10);

        // Create hit area for better interaction
        const hitArea = new Phaser.Geom.Rectangle(-width/2, -height/2, width, height);
        
        // Add elements to container in correct order
        container.add([shadow, background, buttonText]);

        // Function to darken a hex color
        const darkenColor = (color, percent) => {
            const r = ((color >> 16) & 0xFF) * (1 - percent);
            const g = ((color >> 8) & 0xFF) * (1 - percent);
            const b = (color & 0xFF) * (1 - percent);
            return (r << 16) | (g << 8) | b;
        };

        const changeBackgroundColor = (color) => {
            background.clear();
            background.fillStyle(color, 1);  // Slightly darker
            background.fillRoundedRect(-width/2, -height/2, width, height, 10);
        };
        const hoverColor = darkenColor(baseColor, 0.1);
        const clickColor = darkenColor(baseColor, 0.2);
        // Make container interactive with color variations based on the provided backgroundColor
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => {
                changeBackgroundColor(hoverColor);
            })
            .on('pointerout', () => {
                changeBackgroundColor(baseColor);
            })
            .on('pointerdown', () => {
                changeBackgroundColor(clickColor);
                if (callback) callback();
            })
            .on('pointerup', () => {
                changeBackgroundColor(hoverColor);
            });

        return container;
    }    
}

export default WorldScene;