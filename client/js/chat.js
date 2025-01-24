import socket from '/socket.js';

let myID = null;

window.addEventListener('load', () => {       
    socket.on('init message', (message) => {
        if(message.id) {
            myID = message.id;
        }
    });
    /*socket.on('message', function(data) {
        var t = document.getElementById('time');
        t.innerHTML = data;
    });*/

    socket.on('chat message', (data) => {
        var msg = document.getElementById('messages');
        msg.innerHTML += data + "<br/>";
    });

    var btsend = document.getElementById('btsend');
    btsend.addEventListener('click', () => {
        var txtmessage = document.getElementById('txtmessage');
        socket.emit('chat message', txtmessage.value);
    });
});