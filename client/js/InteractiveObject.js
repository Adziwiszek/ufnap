import sessionManager from '../SessionManager.js';

class InteractiveObject {
    constructor(x, y) {
        this.setPosition(x, y);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if(this.sprite) {
            this.sprite.x = x;
            this.sprite.y = y;
        }
        return this;
    }

    setSprite(sprite) {
        this.sprite = sprite;
        this.setPosition(this.x, this.y);
        return this;
    }

    setCallback(callback) {
        this.callback = callback;
        return this;
    }

    makeInteractive() {
        if(!this.sprite) return;

        this.sprite.setInteractive();
        this.sprite.on('pointerdown', this.callback);
        return this;
    }
}

export { InteractiveObject };