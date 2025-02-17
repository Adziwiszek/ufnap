import socket from './../socket.js';

class SessionManager {
    constructor(){
        this.socket = socket;

        this.connected = false;
        this.connectionListeners = [];
        this.eventListeners = {};

        this.resetIdPromise();
    }

    resetIdPromise() {
        this.idReadyPromise = new Promise((resolve) => {
            this.resolveIdPromise = resolve;
        });
    }

    waitForId() {
        return this.idReadyPromise;
    }

    connect(key) {
        this.socket.emit('clientReady', {key});
        this.socket.on('initMessage', (message) => {
            if(!message.id) {
                console.error('Server did not send id!');
                return;
            }
            this.myID = message.id;
            this.connected = true;
            this.resolveIdPromise(this.myID);

            this.isConnected = true;
            this.connectionListeners.forEach(listener => listener());
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Disconnected from server');
        });
    }

    emit(eventName, data) {
        // console.log(`${this.isConnected}`);
        // if (!this.isConnected) {
        //     console.warn(`Cannot emit ${eventName}: Not connected`);
        //     return;
        // }
        this.socket.emit(eventName, data);
    }

    on(eventName, callback) {
        if(!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
            this.socket.on(eventName, (data) => {
                this.eventListeners[eventName].forEach(listener => {
                    listener(data);
                });
            });
        }
        this.eventListeners[eventName].push(callback);
    }

    removeListener(eventName, callback) {
        if(this.eventListeners[eventName]) {
            this.eventListeners[eventName] = 
                this.eventListeners[eventName].filter(listener => listener !== callback);
        }
    }

    removeAllListeners(eventName) {
        if(this.eventListeners[eventName]) {
            this.socket.off(eventName);
            delete this.eventListeners[eventName];
        }
    }

    joinScene(sceneName) {
        socket.emit('joiningRoom', { key: sceneName });
    }
}

const sessionManager = new SessionManager();
export default sessionManager;
