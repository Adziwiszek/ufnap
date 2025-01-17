const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.static(path.join(__dirname, '../client')));

app.use((req, res, next) => {
  console.log(req.url);  // Log the requested path
  next();
});

app.get('/', (req, res) => {
    res.render('index.html');
});

let players = {}

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Initialize player
  players[socket.id] = { x: 100, y: 100 };
  socket.emit('currentPlayers', players); // Send current players
  socket.broadcast.emit('newPlayer', { id: socket.id, x: 100, y: 100 });

  // Handle player movement
  socket.on('move', (direction) => {
      const player = players[socket.id];
      if (!player) return;

      if (direction === 'left') player.x -= 5;
      if (direction === 'right') player.x += 5;
      if (direction === 'up') player.y -= 5;
      if (direction === 'down') player.y += 5;

      io.emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      delete players[socket.id];
      io.emit('playerDisconnected', socket.id);
  });
});

server.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
})
