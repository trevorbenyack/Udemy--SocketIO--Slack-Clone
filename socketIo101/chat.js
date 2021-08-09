const express = require('express');
const app = express();
const socketio = require('socket.io');

app.use(express.static(__dirname + '/public'));

// because we're using express, this is what we need socket.io to listen to
const expressServer = app.listen(9000);
const io = socketio(expressServer);

// socket is the socket itself, i.e. the the underlying socket to the client 
// that has just connected
// A SOCKET ALWAYS BELONGS TO A NAMESPACE
// since we haven't provided a namespace, this is the main/default namespace
// that the client is connecting to
io.on('connection', (socket) => {
    console.log(socket.id);

    // when the client connects, (e.g. in this block) this is when to add 
    // the listeners

    socket.emit('messageFromServer', {data: "Welcome to the socketio server"});
    socket.on('messageToServer', (dataFromClient) => {
        console.log(dataFromClient);
    })

    socket.on('newMessageToServer', (msg) => {
        // console.log(msg);
        io.emit('messageToClients', {text: msg.text});
    });
    
    // socket.emit('ping');
    // socket.on('pong', () => {
    //     console.log('pong received from client');
    // })
})

