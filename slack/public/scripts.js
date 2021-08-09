const username = prompt("What is your user name?");

// const socket = io("http://localhost:9000");
// const socket2 = io('http://localhost:9000/wiki');
// const socket3 = io('http://localhost:9000/mozilla');
// const socket4 = io('http://localhost:9000/linux');

const socket = io("http://localhost:9000", {
    query: {
        username: username
    }
});

let nsSocket = "";

// listen for nsList, which is a list of all the namespaces
socket.on('nsList', (nsData) => {
    console.log("The list of namespaces have arrived!");
    console.log("nsData is: ");
    console.log(nsData);
    let namespacesDiv = document.querySelector('.namespaces');
    namespacesDiv.innerHTML = "";
    nsData.forEach((ns) => {
        namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src=${ns.img}></div>`
    });

    // add a click listener for each NS
    Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
        console.log(elem);
        elem.addEventListener('click', (e) => {
            const nsEndpoint = elem.getAttribute('ns');
            console.log(`${nsEndpoint} I should go to now`);
            joinNs(nsEndpoint);
        });
    });

    // // TODO: FIGURE OUT HOW TO LOAD THIS DYNAMICALLY
    console.log(`Autojoing ${nsData[0].endpoint}`);
    joinNs(`${nsData[0].endpoint}`);
})

