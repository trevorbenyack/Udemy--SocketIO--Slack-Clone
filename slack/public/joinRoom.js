function joinRoom(roomName) {

    // Send this roomName to the server!
    // the last parameter is an acknowledgement callback that the server will run
    nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
        
        // we want to update the room memeber total now that we have joined!
        document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;

        document.querySelector('.curr-room-text').innerHTML = `${roomName}`;
    });

    nsSocket.on('historyCatchUp', (history) => {
        console.log(history);
        
        const messagesUl = document.querySelector('#messages');
        messagesUl.innerHTML = "";
        history.forEach((msg) => {
            const newMsg = buildHTML(msg);

            // grab what's currently displayed
            const currentMessages = messagesUl.innerHTML;

            // This is to build from the top down instead of the bottom up
            messagesUl.innerHTML = currentMessages + newMsg;

            // This will tell the browser to scroll to the bottom of the div
            messagesUl.scrollTo(0, messagesUl.scrollHeight);
        });

        // update UI with new member count when a new member joins
        nsSocket.on('updateMembers', (numMembers) => {
            document.querySelector('.curr-room-num-users').innerHTML = `${numMembers} <span class="glyphicon glyphicon-user"></span>`;
        });

        let searchBox = document.querySelector('#search-box');
        searchBox.addEventListener('input',(e) => {
            console.log(e.target.value);

            // grab all messages and turn them into an array
            let messages = Array.from(document.getElementsByClassName('message-text'));

            // loop through messages and check to see if the search term is inside one of the messages
            messages.forEach((msg) => {
                if(msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) {
                    // the message does not contain the user search term!
                    msg.style.display = "none";
                } else {
                    msg.style.display = "block";
                }
            })
        })

    });

}