// These namespaces are completely separate
const socket1 = io("http://localhost:9000"); // is the "/"" namespace/endpoint
const socket2 = io("http://localhost:9000/admin"); // is the "admin" namespace/endpoint
// const socket3 = io("http://localhost:9000/marketing"); // the "marketing" namespace/endpoint

socket1.on('connect', () => {
    console.log(`socket1 id is: ${socket1.id}`)
})

socket2.on('connect', () => {
    console.log(`socket2 id is: ${socket2.id}`)
})

socket1.on('messageFromServer', (dataFromServer) => {
    console.log(dataFromServer);
    socket1.emit('messageToServer', { data: "This is from the client" });
});

socket2.on('welcome', (msg) => {
    console.log(msg);
});


document.querySelector('#message-form').addEventListener('submit', (event => {
    event.preventDefault();
    console.log("Form Submitted!");
    const newMessage = document.querySelector('#user-message').value;
    console.log(newMessage);
    socket1.emit('newMessageToServer', { text: newMessage });
}));

socket1.on('messageToClients', (msg) => {
    document.querySelector("#messages").innerHTML += `<li>${msg.text}</li>`;
});


// socket.on('ping', () => {
//     console.log('Ping was received from the server');
//     socket.emit('pong');

// });

// socket.on('pong', (latency) => {
//     console.log(latency);
//     console.log('Pong was sent to the server');
// });