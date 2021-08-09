const express = require('express');
const app = express();
const socketio = require('socket.io');
let namespaces = require('./data/namespaces');

app.use(express.static(__dirname + '/public'));

// server and socketio setup
const expressServer = app.listen(9000);
const io = socketio(expressServer);

// When the the socket connects to the main namespace, emit a list
// of the known namespaces
io.on('connection', (socket) => {

    console.log('original connection handshake:');
    console.log(socket.handshake);

    // build an array to send back with the img and endpoint for each NS
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    });

    // console.log(nsData);

    // send the nsData back to the client. 
    // We need to use socket, NOT io, because we weant it
    // go to just this client
    console.log("Sending namespaces list to client...");
    socket.emit('nsList', nsData);

});

// loop through each namespace and listen for a connection
namespaces.forEach((namespace) => {
    
    io.of(namespace.endpoint).on('connection', (nsSocket) => {

        console.log(`${nsSocket.id} has joined ${namespace.endpoint}`)

        // The handshake is only made once, and then after that can be accessed
        // by subsequent sockets
        const user = nsSocket.handshake.query.username;

        console.log(`\n${namespace.endpoint}'s handshake is:`);
        console.log(nsSocket.handshake);
        console.log(`Username is ${user}\n`);

        // When a socket has connected to one of our chatgroup namespaces
        // send the list of rooms for that namespace back
        console.log(`Sending rooms list for ${namespace.endpoint}...`);
        nsSocket.emit('nsRoomLoad', namespace.rooms);

        // numberOfUsersCallback is a callback that is received from the client
        nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {

            // exit previously joined room
            // First room in the object is always unique to the user
            // Other joined rooms are listed after
            // If our code is set up correctly, we should only be joined to our unique room
            // and only one other room (index [1]);
            const roomToLeave = Object.keys(nsSocket.rooms)[1]; 
            
            // Due to the asynchronous behavior of leave(), the join() function below
            // could execute before leave() was finished. Tried chaining them with a .then() 
            // but couldn't get it to work....
            if (roomToLeave && roomToLeave !== roomToJoin) {
                console.log(`Disconnecting ${user} from the ${roomToLeave} room`);
                nsSocket.leave(roomToLeave);
            }
            updateUsersInRoom(namespace, roomToLeave);

            // deal with history... once we have it
            console.log(`Joining ${user} to ${roomToJoin}`);
            nsSocket.join(roomToJoin);

            // this is how to get the number of clients in a room
            io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
                // we then call the callback to send the number of clients
                numberOfUsersCallback(clients.length);
            });

            // find the room to send its history
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomToJoin;
            });

            // send history to client
            console.log(`Sending ${nsRoom.roomTitle}'s history to ${user}...`);
            nsSocket.emit('historyCatchUp', nsRoom.history);

            updateUsersInRoom(namespace, roomToJoin);
            
        });

        nsSocket.on('newMessageToServer', (msg) => {

            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: user,
                avatar: 'https://via.placeholder.com/30'
            };
            
            console.log(`fullMsg is:`)
            console.log(fullMsg);

            // send this message to ALL the sockets that are in the room that THIS socket is in
            // Question: How can find out what rooms THIS socket is in?

            // the first property and value of the nsSocket.rooms object is always the socketId (they're the same)
            // This is the case because a socket ALWAYS joins its own room immediately upon connection to a namespace
            // The second property will always be the next room
            // console.log(nsSocket.rooms);

            // get the keys
            // Turns this into an array of the keys
            const roomTitle = Object.keys(nsSocket.rooms)[1];

            // we need to find the room object for this room
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle;
            });
            
            console.log(`The room object that we made that matches this NS room is:`);
            console.log(nsRoom);

            console.log(`Adding message to history...`);
            nsRoom.addMessage(fullMsg);

            console.log('Sending message to the room...');
            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);

        });
    });
});

function updateUsersInRoom(namespace, roomToJoin) {
    // send back the number of users in this room to ALL sokets connected to this room
    io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
        console.log(`There are ${clients.length} user(s) in ${roomToJoin}`);
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.length);
    });
};

