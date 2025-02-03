import socket from './../socket.js';
import {Player, bubbleTextPadding} from './../player.js';

class SessionManager {
    constructor(){
        this.socket = socket;
        this.connected = false;
        this.connectionListeners = [];
        this.eventListeners = {};

        

        this.idReadyPromise = new Promise((resolve) => {
            this.resolveIdPromise = resolve;
        })
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
            console.log('Connected to server');
            this.connectionListeners.forEach(listener => listener());
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Disconnected from server');
        });
    }

    emit(eventName, data) {
        if (!this.isConnected) {
            console.warn(`Cannot emit ${eventName}: Not connected`);
            return;
        }
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

    initSession() {
        socket.emit('clientReady');
        socket.on('initMessage', (message) => {
            if(!message.id) {
                console.error('Server did not send id!');
                return;
            }
            this.myID = message.id;
            this.connected = true;
        });
    }

    joinScene(sceneName) {
        socket.emit('joiningRoom', { key: sceneName });
    }

    sessionUpdate(scene) {
        socket.on('currentPlayers', (players) => {
            for(let id in players) {
                this.newPlayersQueue({id: id, x: players[id].x, y: players[id].y});
            }
        }); 
        
        socket.on('newPlayer', ({id, x, y}) => {
            console.log('new player joined!');
            this.pushNewPlayer({id: id, x: x, y: y});
        });
            
        socket.on('playerMoved', ({ id, x, y }) => {
            this.pushPlayerMove(id, x, y);
        });
        
        socket.on('playerDisconnected', (id) => {
            this.destroyPlayersQueue.push(id);
        });

        socket.on('chatMessage', (message) => {
            /*let sender = this.players[message.id];
            if (sender) {
                const chatBubble =
                    this.createChatBubble(
                        sender.x,
                        sender.y,
                        message.data
                    );
                chatBubble.id = this.msgCounter++;
                sender.showChatBubble(chatBubble);
            }*/
        });
    }
}

const sessionManager = new SessionManager();
export default sessionManager;
