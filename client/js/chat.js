import socket from '/socket.js';

// eslint-disable-next-line no-unused-vars
let myID = null;

window.addEventListener('load', () => {       
    let btsend = document.getElementById('btsend');
    let txtmessage = document.getElementById('txtmessage');

    function sendMessage() {
        if (txtmessage.value.trim() !== '') {
            socket.emit('chatMessage', txtmessage.value);
            txtmessage.value = '';
        }
    };

    socket.on('initMessages', (message) => {
        if(message.id) {
            myID = message.id;
        }
    });

    /*socket.on('message', function(data) {
        var t = document.getElementById('time');
        t.innerHTML = data;
    });*/

    socket.on('chatMessage', (message) => {
        // console.log(`client received: ${message.data}`);
        if (message && message.data) {
            let msg = document.getElementById('messages');
            msg.innerHTML += message.data + "<br/>";
        } else {
            console.error('Received undefined message', message);
        }
    });

    btsend.addEventListener('click', sendMessage);
    txtmessage.addEventListener('keypress', (event) => {
        if(event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
});