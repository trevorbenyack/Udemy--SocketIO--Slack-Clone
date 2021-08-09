const express = require('express');
const app = express();
const socketio = require('socket.io');

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

// The socket connects to a namespace
io.on('connection', (socket) => {

    // Each socket has it's own room (the socket id)

    // and then that socket can emit to the entire namespace
    socket.emit('messageFromServer', {data: "Welcome to the socketio server"});
    socket.on('messageToServer', (dataFromClient) => {
        console.log(dataFromClient);
    });

    socket.join('level1');
    
    // this comes from the namespace
    // won't display to the user connecting b/c it sends it to everyone else but that user
    socket.to('level1').emit('joined', `${socket.id} says I have joined the level 1 room`);

    // the namespace can emit to a room
    io.of('/').to('level1').emit('joined', `${socket.id} says I have joined the level 1 room`);

    // the namespace can emit to an entire namespace
    io.emit('namespaceToNamespace', "This is a message emittiting to the entire namespace from the namespace");


});

io.of('/admin').on('connection', (socket) => {
    console.log("Someone connected to the admin namespace");
    io.of('/admin').emit('welcome', "Welcome to the admin channel");
});

