const express = require('express');
const app = express();
const socketio = require('socket.io');

// this is where we add the middleware for express to be able to serve up static files
app.use(express.static(__dirname + '/public'));

// because we're using express, this is what we need socket.io to listen to
const expressServer = app.listen(9000);
const io = socketio(expressServer);

// The socket parameter is the socket itself, i.e. the the underlying socket to the client 
// that has just connected....

// A SOCKET ALWAYS BELONGS TO A NAMESPACE
// since we haven't provided a namespace, this is the main/default namespace
// that the client is connecting to

// Note:
// io.on == io.of('/').on

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

        // these two lines are equivalent
        io.emit('messageToClients', {text: msg.text});
        io.of('/').emit('messageToClients', {text: msg.text});
    });

    // The server can still communicate across namespaces
    // but on the client, the socket needs to be in THAT namespace
    // in order to get the events
    // This is just for demo, don't actually use a setTimeout like this...
    setTimeout(() => {
        io.of('/admin').emit('welcome', "Welcome to the admin channel, from the main channel!");
    }, 2000)

});

io.of('/admin').on('connection', (socket) => {
    console.log("Someone connected to the admin namespace");
    io.of('/admin').emit('welcome', "Welcome to the admin channel");
});

