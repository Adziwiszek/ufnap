import sessionManager from "./SessionManager.js";

// eslint-disable-next-line no-unused-vars
let myID = null;

window.addEventListener('load', () => {       
    let btsend = document.getElementById('btsend');
    let txtmessage = document.getElementById('txtmessage');

    function sendMessage() {
        if (txtmessage.value.trim() !== '') {
            sessionManager.emit('chatMessage', txtmessage.value);
            txtmessage.value = '';
        }
    };


    sessionManager.on('chatMessage', (message) => {
        // console.log(`client received: ${message.data}`);
        if (message && message.data) {
            let msg = document.getElementById('messages');
            msg.innerHTML += message.data + "<br/>";
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