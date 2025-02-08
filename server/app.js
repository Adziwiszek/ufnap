const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, '../client/html')));
app.use(express.static(path.join(__dirname, '../client/js')));
app.use(express.static(path.join(__dirname, '../client/css')));
app.use(express.static(path.join(__dirname, '../client')));

// Logowanie

app.use(express.urlencoded({ extended: true })); 

app.use(session({
  secret: 'klucz',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.get('/', (req, res) => {
    res.render('index.html');
});

// Obsługa logowania
app.post('/login', (req, res) => {

  const users = [
    { login: "ola", password: bcrypt.hashSync("123", 10) }
  ];

  const { login, password } = req.body;

  const user = users.find(u => u.login === login);
  if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = login;
      return res.redirect('/game');
  } else {
    return res.send(`
      <script>
        alert('Błędny login lub hasło!');
        window.location.href = "/";
      </script>
    `);
  }
});

//Obsługa rejestracji
app.post('/register', (req, res) => {
  const { login, password, password2} = req.body;

  if (false) { 
    return res.send(`
      <script>
        alert('Użytkownik o tym loginie już istnieje!');
        window.location.href = "/";
      </script>
    `);
  }

  if (password !== password2) {
    return res.send(`
      <script>
        alert('Hasła nie są takie same!');
        window.location.href = "/";
      </script>
    `);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  return res.send(`
    <script>
      alert('`+login+hashedPassword+`');
      window.location.href = "/";
    </script>
  `);
});


app.get('/game', (req, res) => {
  res.redirect('game.html');
});

let players = {}

/*setInterval( function() {
  var date = new Date().toString();
  io.emit( 'message', date.toString() );
}, 1000 );*/

const worldWidth = 2000;
const worldHeight = 1000;

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
      worldWidth: worldWidth,
      worldHeight: worldHeight,
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
