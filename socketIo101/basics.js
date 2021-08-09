// We need http because we don't have express
const http = require('http');

// We need socketio... it's 3rd party!
const socketio = require('socket.io');

// we make an http server with node!
const server = http.createServer((req, res) => {
    res.end("I am connected");
});

const io = socketio(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket, req) => {
    socket.emit('welcome', 'Welcome to the websocket server!!');
    socket.on('message', (msg) => {
        console.log('received: %s', msg);
    });
});

server.listen(8000, () => {
    console.log('listening on port 8000');
});