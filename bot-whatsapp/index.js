const { Client } = require('whatsapp-web.js');
const axios = require('axios');

// const client = new Client();

const client = new Client({
    // authStrategy: new LocalAuth(),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: {
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        headless: false,
    }
});

// client initialize does not finish at ready now.
client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

// Pairing code only needs to be requested once
let pairingCodeRequested = false;
client.on('qr', async (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);

    // paiuting code example
    const pairingCodeEnabled = false;
    if (pairingCodeEnabled && !pairingCodeRequested) {
        const pairingCode = await client.requestPairingCode('5584987631700'); // enter the target phone number
        console.log('Pairing code enabled, code: '+ pairingCode);
        console.log('Number: ' + '558491097019');
        pairingCodeRequested = true;
    }
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', async () => {
    console.log('READY');
    const debugWWebVersion = await client.getWWebVersion();
    console.log(`WWebVersion = ${debugWWebVersion}`);

    console.log(client);
    client.pupPage.on('pageerror', function(err) {
        console.log('Page error: ' + err.toString());
    });
    client.pupPage.on('error', function(err) {
        console.log('Page error: ' + err.toString());
    });

});

client.on('message_create', async (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }

    // Unpins a message
    if (msg.fromMe && msg.body.startsWith('!unpin')) {
        const pinnedMsg = await msg.getQuotedMessage();
        if (pinnedMsg) {
            // Will unpin a message
            const result = await pinnedMsg.unpin();
            console.log(result); // True if the operation completed successfully, false otherwise
        }
    }

    if (msg.body === '!ping') {
        // send back "pong" to the chat the message was sent in
        await axios({
            method: 'post',
            url: 'http://localhost:5000/webhook',
            data: {
                topic: 'Fred',
                target: 'Flintstone',
                value: 545454
            }
        }).then((response) => {
            console.log(response.data);
        }).catch((err) => {
            console.error(err);
        });

        await msg.reply('pong');
    }

    if(msg.body.includes('!tv') ||msg.body.includes('!home') ) {
        let text = msg.body.replace('!', '');
        let [topic, value] = text.split(' ');
        let data = {
            topic: topic,
            value: value
        };

        await axios({
            method: 'post',
            url: 'http://localhost:5000/webhook',
            data: data
        }).then((response) => {
            console.log(response.data.message);
        }).catch((err) => {
            console.error(err);
        });
    }

});