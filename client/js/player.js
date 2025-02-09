const bubbleTextPadding = {west: 10, east: 10, north:10, south: 10};
const textBubbleLifeTime = 2000;

class Player {
    constructor(x, y, parentScene, name=null) {
        this.parentScene = parentScene;
        this.x = x;
        this.y = y;
        this.name = name || "default_name";
        console.log(this.name, "nazywam sie tak!");
    }

    /**
     * Sets position of a player (and their chat bubbles)
     * 
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if (this.sprite) {
            this.sprite.setPosition(x, y);
        }
        if (this.nameText) {
            this.nameText.setPosition(x, y + 30); // Update name position
        }
        if (this.chatBubble) {
            // let bubbleBounds = this.chatBubble.bubble.getBounds();
            this.setChatBubblePosition(this.x, this.y);
        }
    }

    /**
     * Sets player sprite
     * 
     * @param {sprite: Phaser.GameObjects.Sprite} sprite - player sprite
     */
    setSprite(sprite) {
        if(!sprite) {
            console.error('Player has been given null sprite.')
            return;
        }
        this.sprite = sprite;
        this.sprite.setDepth(500);
    }

    setNameText(nameText){
        if(!nameText){
            console.error('Player has been given null nameText');
        }
        this.nameText = nameText;
        this.nameText.setText(this.name);
        this.nameText.setDepth(510);
    }

    /**
     * Sets position of chat bubble relative to player
     * 
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     */
    setChatBubblePosition(x, y) {
        // let contentBounds = this.chatBubble.content.getBounds();
        let playerBounds = this.sprite.getBounds();
        this.chatBubble.bubble.setPosition(x, y - (playerBounds.height/2) - this.chatBubble.bubbleHeight);
        this.chatBubble.content.setPosition(
            x + bubbleTextPadding.west,
            y - (playerBounds.height/2) - this.chatBubble.bubbleHeight + bubbleTextPadding.north
        );
    }

    /**
     * Takes chat bubble object created by the scene and binds it to player.
     * Bubble is destroyed after some time
     * 
     * @param {{bubble: Phaser.GameObjects.Graphics, content: Phaser.GameObjects.Text,
     *            bubbleHeight: number, bubbleWidth: number}} chatBubble 
     */
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

export {Player, bubbleTextPadding}