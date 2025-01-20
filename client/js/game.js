const socket = io();
const canvas = document.getElementsByClassName('gameCanvas')[0];
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const players = {};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw players
    for (const id in players) {
        const { x, y } = players[id];
        ctx.fillStyle = id === socket.id ? 'blue' : 'red';
        ctx.fillRect(x, y, 20, 20); // Player size 20x20
    }

    requestAnimationFrame(draw);
}

// Handle server updates
socket.on('currentPlayers', (serverPlayers) => {
    Object.assign(players, serverPlayers);
});

socket.on('newPlayer', (player) => {
    players[player.id] = { x: player.x, y: player.y };
});

socket.on('playerMoved', ({ id, x, y }) => {
    if (players[id]) {
        players[id].x = x;
        players[id].y = y;
    }
});

socket.on('playerDisconnected', (id) => {
    delete players[id];
});

// Handle movement input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function update() {
    if (keys['a'] || keys['ArrowLeft']) socket.emit('move', 'left');
    if (keys['d'] || keys['ArrowRight']) socket.emit('move', 'right');
    if (keys['w'] || keys['ArrowUp']) socket.emit('move', 'up');
    if (keys['s'] || keys['ArrowDown']) socket.emit('move', 'down');
}

setInterval(update, 1000 / 60); // Update 60 times per second
draw();