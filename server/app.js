const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.render('index.html');
});

let players = {}

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
  // console.log(`Player connected: ${socket.id}`);
  
  socket.on('clientReady', () => {
    // Send any players that are currently connected
    socket.emit('currentPlayers', players);
    
    // Initialize player
    players[socket.id] = { x: 100, y: 100 };

    io.to(socket.id).emit('initMessage', {
      id: socket.id,
      x: players[socket.id].x,
      y: players[socket.id].y,
      worldWidth: adjustedWorldWidth,
      worldHeight: adjustedWorldHeight,
    })
  });
  socket.broadcast.emit('newPlayer', { id: socket.id, x: 100, y: 100 });

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

      io.emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
      // console.log(`Player disconnected: ${socket.id}`);
      delete players[socket.id];
      io.emit('playerDisconnected', socket.id);
  });
  // handling chat
  socket.on('chatMessage', (data) =>{
    // console.log(`server received: ${data}`);
    io.emit('chatMessage', {
      id: socket.id, 
      data: data
    }); // do wszystkich
    //socket.emit('chat message', data); tylko do połączonego
  })
  // handling player updates
  /*setInterval(() => {
    io.emit('update players', players);
  }, 1000/30);*/
});
  
server.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
})
