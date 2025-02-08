import sessionManager from '../SessionManager.js';

class InteractiveObject {
    constructor(x, y, sprite) {
        this.sprite = sprite;
        this.setPosition(x, y);    
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if (this.sprite) {
            this.sprite.setPosition(x, y);
        }
    }

    addServerEventSender(name, data) {
        this.callback = () => sessionManager.emit(name, data);
    }    
}

export default InteractiveObject