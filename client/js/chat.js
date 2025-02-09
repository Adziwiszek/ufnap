import sessionManager from "./SessionManager.js";

// eslint-disable-next-line no-unused-vars
let myID = null;

window.addEventListener('load', () => {       
    let btsend = document.getElementById('btsend');
    let txtmessage = document.getElementById('txtmessage');

    function sendMessage() {
        if (txtmessage.value.trim() !== '') {
            sessionManager.emit('chatMessage', txtmessage.value, null); // tu wstawić nazwę gracza
            txtmessage.value = '';
        }
    };


    sessionManager.on('chatMessage', (message, player_name=null) => {
        // console.log(`client received: ${message.data}`);
        player_name = player_name || "default_name";
        if (message && message.data) {
            let msg = document.getElementById('messages');
            msg.innerHTML += player_name + ": " + message.data + "<br/>";
        } else {
            console.error('Received undefined message', message);
        }
    });

    
    btsend.addEventListener('click', sendMessage);
    txtmessage.addEventListener('keydown', (event) => {
        if(event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        } else if (event.key === ' ') {
            // this is for fixing space not working on input
            txtmessage.value += ' ';
        }
    });

    window.addEventListener('keydown', (event) => {
        if (document.activeElement === txtmessage) {
            return;
        }

        if (event.key === ' ') {
            event.preventDefault(); 
        }
    });
});