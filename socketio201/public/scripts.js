const socket = io("http://localhost:9000");
const socket2 = io('http://localhost:9000/admin')

socket.on('messageFromServer', (dataFromServer) => {
    console.log(dataFromServer);
    socket.emit('messageToServer', { data: "This is from the client" });

});

socket.on('joined', (msg) => {
    console.log(msg);
});

socket2.on('welcome', (dataFromServer) => {
    console.log("inside of socket2 welcome");
    console.log(dataFromServer);
});

document.querySelector('#message-form').addEventListener('submit', (event => {
    event.preventDefault();
    console.log("Form Submitted!");
    const newMessage = document.querySelector('#user-message').value;
    console.log(newMessage);
    socket.emit('newMessageToServer', { text: newMessage });
}));