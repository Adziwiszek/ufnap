window.addEventListener('load', () => {       
    var socket = io();
    /*socket.on('message', function(data) {
        var t = document.getElementById('time');
        t.innerHTML = data;
    });*/

    socket.on('chat message', function(data) {
        var msg = document.getElementById('messages');
        msg.innerHTML += data + "<br/>";
    });

    var btsend = document.getElementById('btsend');
    btsend.addEventListener('click', function() {
        var txtmessage = document.getElementById('txtmessage');
        console.log('sending message: ' + txtmessage);
        socket.emit('chat message', txtmessage.value);
    });
});