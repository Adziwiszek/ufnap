const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../client/html')));
app.use(express.static(path.join(__dirname, '../client/js')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/html/index.html'));  
});

let players = {};

/*setInterval( function() {
  var date = new Date().toString();
  io.emit( 'message', date.toString() );
}, 1000 );*/
const worldWidth = 2000;
const worldHeight = 1000;
// adjusts world size to be multiple of tile size (32)
const adjustedWorldWidth = Math.ceil(worldWidth / 32) * 32;
const adjustedWorldHeight = Math.ceil(worldHeight / 32) * 32;

// Handle socket connections
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    socket.on('clientReady', ({key: sceneName}) => {
        console.log(`player joining scene ${sceneName}`);

        // Add player to the room
        socket.join(sceneName);

        // Send players that are already in this room
        const roomPlayers = {};
        for(const id in players) {
            if(players[id].currentRoom === sceneName) {
                roomPlayers[id] = players[id];
            }
        }
        io.to(socket.id).emit('currentPlayers', roomPlayers);

        // Initialize player
        players[socket.id] = { x: 99, y: 100, currentRoom: sceneName};
        console.log(`create player with id = ${socket.id}`);
    
        io.to(socket.id).emit('initMessage', {
          id: socket.id,
          x: players[socket.id].x,
          y: players[socket.id].y,
          worldWidth: adjustedWorldWidth,
          worldHeight: adjustedWorldHeight,
        })
        socket.broadcast.to(sceneName).emit('newPlayer', { id: socket.id, x: 100, y: 100 });
    });
  
    // Handle player movement
    socket.on('move', (direction) => {
        const player = players[socket.id];
        if (!player) return;
    
        if (direction === 'left') player.x -= 5;
        if (direction === 'right') player.x += 5;
        if (direction === 'up') player.y -= 5;
        if (direction === 'down') player.y += 5;
        // checking if player went out of bounds
        player.x = Math.max(player.x, 0);
        player.x = Math.min(player.x, worldWidth);
        player.y = Math.max(player.y, 0);
        player.y = Math.min(player.y, worldHeight);
        io.in(player.currentRoom).emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        console.log(players[socket.id], '\n');
        if(players[socket.id]) {
            const playerRoom = players[socket.id].currentRoom;
            io.in(playerRoom).emit('playerDisconnected', socket.id);
        }
        delete players[socket.id];
    });
    // handling chat
    socket.on('chatMessage', (data) =>{
        const player = players[socket.id];
        if(!player) {
            console.error('received message from null player!');
            return;
        }
        io.in(player.currentRoom).emit('chatMessage', {
            id: socket.id, 
            data: data
        }); 
    })
    // Handle player changing rooms
    socket.on('changeRoom', ({ newRoom }) => {
        console.log('player is exiting current room!');
        console.log(players[socket.id]);
        const player = players[socket.id];
        const currentRoom = players[socket.id].currentRoom;
        // tell players in old room about disconnect
        socket.broadcast.to(currentRoom).emit('playerDisconnected');

        socket.leave(player.currentRoom);
        socket.join(newRoom);
        player.currentRoom = newRoom;

        // notify other players in this room
        socket.broadcast.to(newRoom).emit('newPlayer', { id: socket.id, x: player.x, y: player.y });
    });
    // handling player updates
    /*setInterval(() => {
    io.emit('update players', players);
    }, 1000/30);*/
});
  
server.listen(3000, () => {
    // var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http:/localhost:%s', port);
})
