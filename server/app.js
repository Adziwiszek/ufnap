const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const bcrypt = require('bcrypt');
const session = require('express-session');
const dbrepo = require('./databases/db.js');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const tictactoe = require('./games/tictactoe.js');

app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../client/html')));
app.use(express.static(path.join(__dirname, '../client/js')));

// Logowanie

app.use(express.urlencoded({ extended: true }));

const sessionMiddleware = session({
  secret: 'klucz',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/html/index.html'));  
});

// Obsługa logowania
app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  
  try {
    const userExists = await dbrepo.userExists(login);
    if (!userExists) {
      return res.send(`
        <script>
          alert('Błędny login lub hasło!');
          window.location.href = "/";
        </script>
      `);
    }
    
    const validPassword = await dbrepo.validatePassword(login, password);
    console.log(validPassword);
    if (validPassword) {
      req.session.user = {username : login};
      return res.redirect('/game');
    } else {
      return res.send(`
        <script>
          alert('Błędny login lub hasło!');
          window.location.href = "/";
        </script>
      `);
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

//Obsługa rejestracji

app.post('/register', async (req, res) => {
  const { login, password, password2 } = req.body;
  
  if (password !== password2) {
    return res.send(`
      <script>
        alert('Hasła nie są takie same!');
        window.location.href = "/";
      </script>
    `);
  }
  
  try {
    const userExists = await dbrepo.userExists(login);
    if (userExists) {
      return res.send(`
        <script>
          alert('Użytkownik o tym loginie już istnieje!');
          window.location.href = "/";
        </script>
      `);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await dbrepo.createUser(login, hashedPassword);
    
    return res.send(`
      <script>
        alert('Rejestracja udana! Możesz się teraz zalogować.');
        window.location.href = "/";
      </script>
    `);
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

app.get('/game', (req, res) => {
  res.redirect('game.html');
});

app.get('/session', (req, res) => {
  res.json(req.session.user);
});


let players = {};
let worldSettings = {};
let games = {};
let tictoctest = {};

function adjustWorldSize(width, height) {
    return {
        width: Math.ceil(width / 32) * 32,
        height: Math.ceil(height / 32) * 32
    }
}

function flattenBoard(board) {
    const res = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            res.push(board[i][j]);
        }
    }
    return res;
}
// Handle socket connections
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    const session = socket.request.session;
    if (session && session.user) {
        console.log(`User from session: ${session.user.username}`);
    } else {
        console.log("No user found in session.");
    }
    
    socket.on('clientReady', async ({key: sceneName}) => {
        console.log(`player joining scene ${sceneName}`);

        const session = socket.request.session;
        if (session && session.user) {
            console.log(`User from session: ${session.user.username}`);
        } else {
            console.log("No user found in session.");
        }

        // Add player to the room
        socket.join(sceneName);

        if(!players[socket.id]) {

            players[socket.id] = { 
              x: 99, 
              y: 100, 
              currentRoom: sceneName, 
              subroom: null, 
              name : session?.user?.username || "default_name",
              games: {
                'TicTacToeScene': {
                  gameId: null
                }
              },
              isPlaying: false,
            };

            console.log(session?.user?.username || "default_name", "!!!");
            console.log(`create player with id = ${socket.id}`);
        }

        // Send players that are already in this room
        const roomPlayers = {};
        for(const id in players) {
            if(id == socket.id) continue;
            if(players[id].currentRoom === sceneName) {
                roomPlayers[id] = players[id];
            }
        }
        io.to(socket.id).emit('currentPlayers', roomPlayers);

    
        io.to(socket.id).emit('initMessage', {
          id: socket.id,
          x: players[socket.id].x,
          y: players[socket.id].y,
          name: players[socket.id].name,
          worldWidth: worldSettings[sceneName].width,
          worldHeight: worldSettings[sceneName].height,
        })
        socket.broadcast.to(sceneName).emit('newPlayer', { id: socket.id, x: 100, y: 100 , name:session?.user?.username || "default_name"});
    });

    // Handle player joining gamequeue
    socket.on('joinGameQueue', (data) => {
      const player = players[socket.id];
      if(player.isPlaying) {
        return;
      }
      const gameName = player.currentRoom;
      // handle game cases (maybe move out to other functions)
      if(gameName === 'TicTacToeScene') {
        if(games[gameName].queue.length === 0 &&
          !games[gameName].queue.includes(socket.id)
        ) {
          games[gameName].queue.push(socket.id);
          io.to(socket.id).emit('addedToTheQueue', {});
          console.log('added player to the queue')
        } else if(!games[gameName].queue.includes(socket.id)) {
          const player1Id = games[gameName].queue.pop();
          const player2Id = socket.id;
          // Create new game instance
          const gameId = `game_${Date.now()}`;
          games[gameName].instances[gameId] = {
              players: [player1Id, player2Id],
              currentTurn: player1Id
          };

          // player2 always starts!
          io.to(player1Id).emit('gameStart', { 
              gameId: gameId,
              symbol: 'O',
              opponentSymbol: 'X',
              opponentId: player2Id,
              player1: {
                id: player1Id,
                symbol: 'O',
                name: players[player1Id].name
              },
              player2: {
                id: player2Id,
                symbol: 'X',
                name: players[player2Id].name
              },
          });
          io.to(player2Id).emit('gameStart', {
              gameId: gameId, 
              symbol: 'X',
              opponentSymbol: 'O',
              opponentId: player1Id,
              player1: {
                id: player1Id,
                symbol: 'O',
                name: players[player1Id].name
              },
              player2: {
                id: player2Id,
                symbol: 'X',
                name: players[player2Id].name
              },
          });
          games[gameName].instances[gameId].game = new tictactoe();
          games[gameName].instances[gameId].player1 = player1Id
          games[gameName].instances[gameId].player2 = player2Id

          
          players[player1Id].games[gameName].gameId = gameId;
          players[player1Id].isPlaying = true;
          players[player2Id].games[gameName].gameId = gameId;
          players[player2Id].isPlaying = true;

          console.log(`Game started between ${player1Id} and ${player2Id}`);
        }
      }
    });

    socket.on('leaveGameQueue', (data) => {
      const player = players[socket.id];
      const gameName = player.currentRoom;
      if(gameName === 'TicTacToeScene') {
        if(games[gameName].queue.length > 0 &&
          games[gameName].queue[0] === socket.id
        ) {
          const a = games[gameName].queue.pop();
          console.log('player left the queue');
          io.to(socket.id).emit('leftQueue', {});
        }
      }
    });

    socket.on('quitGame', (data) => {
      players[socket.id].isPlaying = false;
    });


    socket.on('tictactoemove', (data) => {
      const gameid = players[socket.id].games['TicTacToeScene'].gameId;
      const player1Id = games['TicTacToeScene'].instances[gameid].player1;
      const player2Id = games['TicTacToeScene'].instances[gameid].player2;
      const game = games['TicTacToeScene'].instances[gameid].game;
      let playerNumber = 1;
      if(socket.id === player2Id) {
        playerNumber = 2;
      }
      const cellid = data.cellid;
      const pos = [Math.floor(cellid / 3), cellid % 3];
      let result = game.attemptMove(pos, playerNumber);
      data.result = result;
      const board = flattenBoard(game.getBoard()); 
      board.forEach((field, index) => {
        if(field === '.') {
          data[index] = 'emptyCell';
        } else if(field === 'O') {
          data[index] = 'OCell';
        } else if(field === 'X') {
          data[index] = 'XCell';
        }
      });
      data.currentPlayer = game.playersMark();
      data.currentPlayerId = playerNumber === 1 ? player2Id : player1Id;
      if(result === 3) {
          io.to(player1Id).emit('gameEnd', { 
              result: `${players[player1Id].name} won!`,
          });
          io.to(player2Id).emit('gameEnd', { 
              result: `${players[player1Id].name} won!`,
          });
      } else if(result === 4) {
          io.to(player1Id).emit('gameEnd', { 
              result: `${players[player2Id].name} won!`,
          });
          io.to(player2Id).emit('gameEnd', { 
              result: `${players[player2Id].name} won!`,
          });
      } else if(result === 5) {
          io.to(player1Id).emit('gameEnd', { 
              result: `Draw!`,
          });
          io.to(player2Id).emit('gameEnd', { 
              result: `Draw!`,
          });
      } 
      io.to('TicTacToeScene').emit('tictactoeresponse', data);
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
        const worldWidth = worldSettings[player.currentRoom].width;
        const worldHeight = worldSettings[player.currentRoom].height;
        player.x = Math.max(player.x, 25.6);
        player.x = Math.min(player.x, worldWidth-25.6);
        player.y = Math.max(player.y, 25.6);
        player.y = Math.min(player.y, worldHeight-25.6);
        io.in(player.currentRoom).emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        console.log(players[socket.id], '\n');
        if(players[socket.id]) {
            const playerRoom = players[socket.id].currentRoom;
            for(let gameName in games) {
              // Remove player from queue if they're in it
              const queueIndex = games[gameName].queue.indexOf(socket.id);
              if (queueIndex !== -1) {
                  games[gameName].queue.splice(queueIndex, 1);
                  console.log(`Removed disconnected player ${socket.id} from ${gameName} queue`);
              }
            }
            io.in(playerRoom).emit('playerDisconnected', { id: socket.id });
        }
        delete players[socket.id];
    });
    // handling chat
    socket.on('chatMessage', (data) =>{
        console.log(`sender id = ${socket.id}`);
        const player = players[socket.id];
        if(!player) {
            console.error('received message from null player!');
            return;
        }
        io.in(player.currentRoom).emit('chatMessage', {
            id: socket.id, 
            data: data,
            session: socket.request.session
        }); 
    });
    // Handle player changing rooms
    socket.on('changeRoom', ({ newRoom, outX, outY }) => {
        console.log('player is exiting current room!');
        console.log(players[socket.id]);
        const player = players[socket.id];
        const currentRoom = players[socket.id].currentRoom;

        // tell players in old room about disconnect
        socket.broadcast.to(currentRoom).emit('playerDisconnected', { id: socket.id });

        socket.leave(player.currentRoom);
        //socket.join(newRoom);
        if(outX && outY) {
            console.log('changing player position when switching rooms');
            player.x = outX;
            player.y = outY;
        }
        player.currentRoom = newRoom;
        console.log(players);

        const session = socket.request.session;
        if (session && session.user) {
            console.log(`User from session: ${session.user.username}`);
        } else {
            console.log("No user found in session.");
        }

      // notify other players in this room
        socket.broadcast.to(newRoom).emit('newPlayer', { id: socket.id, x: player.x, y: player.y, name: session?.user?.username || "default_name"});
    });
});

  
server.listen(3000, () => {
    worldSettings['TestLobbyScene'] = adjustWorldSize(1000, 1000);
    worldSettings['HouseScene'] = adjustWorldSize(2000, 500);
    worldSettings['TicTacToeScene'] = adjustWorldSize(200, 200);
    games['TicTacToeScene'] = {
      queue: [],
      instances: {}
    };
    // var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http:/localhost:%s', port);
})
