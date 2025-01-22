import socket from './../socket.js';

const players = {};
const playersSprites = {};
let myID = null;

class WorldScene extends Phaser.Scene {
    player;

    constructor () {
       super('WorldScene');
       WorldScene.instance = this;
    }

    preload ()
    {

    }

    create ()
    {
        this.cursors = this.input.keyboard.createCursorKeys();
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
       
        for(let id in players) {
            const sp = playersSprites[id];
            const player = players[id];
            if(sp) {
                sp.setPosition(player.x, player.y);
            }
        }
    }

    addPlayer(tint=0xf24f44) {
        let newPlayer = this.add.sprite(200, 200, 'player');
        newPlayer.setScale(0.1);
        newPlayer.setTint(tint);
        return newPlayer;
    }
}

socket.on('init message', (message) => {
    if(message.id) {
        myID = message.id;
        playersSprites[myID] = WorldScene.instance.addPlayer(0x7eb7ed);
    }
})

// Handle server updates
socket.on('currentPlayers', (serverPlayers) => {
    // Clearing old players
    for(let id in players) {
        delete players[id];
    }
    // Reassigning new players from server
    for(let id in serverPlayers) {
        players[id] = {x: serverPlayers.x, y: serverPlayers.y};
    }
    // Object.assign(players, serverPlayers);
});

socket.on('update players', (serverPlayers) => {
    for(let id in serverPlayers) {
        if (!playersSprites[id]) {
            playersSprites[id] = WorldScene.instance.addPlayer();
        }
        players[id] = serverPlayers[id];
        playersSprites[id].setPosition(players[id].x, players[id].y);
    }
});

socket.on('newPlayer', (player) => {
    players[player.id] = { x: player.x, y: player.y};
    playersSprites[player.id] = WorldScene.instance.addPlayer();
});

socket.on('playerMoved', ({ id, x, y }) => {
    if (players[id]) {
        // console.log('player with id + ' + id + ' moved');
        players[id].x = x;
        players[id].y = y;
        const sprite = playersSprites[id];
        if (sprite) {
            sprite.setPosition(x, y);
        } else {
            console.warn(`Sprite not found for player ${id}`);
        }
    }
});

socket.on('playerDisconnected', (id) => {
    const sprite = playersSprites[id];
    if (sprite) {
        sprite.destroy();
    }
    delete players[id];
    delete playersSprites[id];
});

export default WorldScene;