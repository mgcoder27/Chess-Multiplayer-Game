const { createServer } = require('http');
const { readFile } = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const { createMatchmaker } = require('./matchmaking');

const publicRoot = __dirname;
const contentTypes = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
};

function serveFile(request, response) {
    const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filePath = path.resolve(publicRoot, `.${requestPath === '/' ? '/index.html' : requestPath}`);

    if (!filePath.startsWith(publicRoot + path.sep)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
    }

    readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(error.code === 'ENOENT' ? 404 : 500);
            response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
            return;
        }

        response.writeHead(200, {
            'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream'
        });
        response.end(data);
    });
}

const httpServer = createServer(serveFile);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
    }
});

let totalPlayers = 0;
let players = {};
const matchmaker = createMatchmaker();

function fireTotalPlayers(){
    io.emit('total-players', totalPlayers);
}

function fireMatches({ opponentId, socketId , time}) {
    players[socketId].emit('match-found', 'white', time);
    players[opponentId].emit('match-found', 'black', time); 
    

    players[socketId].on('Sync_state', (fen, turn) => {
        players[opponentId].emit('sync_state_server', fen, turn);
    });

    players[opponentId].on('Sync_state', (fen, turn) => {
        players[socketId].emit('sync_state_server', fen, turn);
    });

    players[socketId].on('game_over', (winner) => {
        players[opponentId].emit('game_over_server', winner);
    })
    players[opponentId].on('game_over', (winner) => {
        players[socketId].emit('game_over_server', winner);
    });
}


function handleplayrequest(socket, time) {
    const result = matchmaker.addPlayer(socket.id, time);
    if (!result) {
        return;
    }  

    if (result.status === 'matched') {
        fireMatches({
            opponentId: result.blackId,
            socketId: result.whiteId,
            time: result.time
        });
    }
}

io.on('connection', (socket) => {
    totalPlayers++;
    players[socket.id] = socket;
    socket.on('time-selected', function (time) {
        handleplayrequest(socket, time);
    });
    fireTotalPlayers();

    socket.on('disconnect', () => {
        totalPlayers = Math.max(0, totalPlayers - 1);
        delete players[socket.id];
        matchmaker.removePlayer(socket.id);
        fireTotalPlayers();
    });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
    console.log(`listening to port ${port}`);
});