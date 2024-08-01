const {Client, LocalAuth} = require('whatsapp-web.js');
const mqtt = require('mqtt');
const dotenv = require('dotenv');
dotenv.config();
let clientMqtt = null;
let bot = null;
const ip_broker = process.env.IP_BROKER;
const my_phone = process.env.MY_PHONE_NUMBER;
const topic_whatsapp = process.env.TOPIC_Whatsapp;

function initClientMqtt() {
    clientMqtt = mqtt.connect(`mqtt://${ip_broker}`, {
        keepalive: 3,
        port: 1883,
        reconnectPeriod: 15000,
        rejectUnauthorized: false,
    });
    clientMqtt.on("connect", () => {
        clientMqtt.subscribe("presence", (err) => {
            if (!err) {
                clientMqtt.publish("presence", "Hello mqtt");
            }
        });
    });
    return clientMqtt;
}

function initBotClient() {
    // const client = new Client();

    bot = new Client({
        authStrategy: new LocalAuth(),
        // proxyAuthentication: { username: 'username', password: 'password' },
        puppeteer: {
            // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
            headless: false,
        }
    });

// client initialize does not finish at ready now.
    bot.initialize();

    bot.on('loading_screen', (percent, message) => {
        console.log('LOADING SCREEN', percent, message);
    });

    // Pairing code only needs to be requested once
    let pairingCodeRequested = false;
    bot.on('qr', async (qr) => {
        // NOTE: This event will not be fired if a session is specified.
        console.log('QR RECEIVED', qr);

        // paiuting code example
        const pairingCodeEnabled = false;
        if (pairingCodeEnabled && !pairingCodeRequested) {
            const pairingCode = await client.requestPairingCode('5584987631700'); // enter the target phone number
            console.log('Pairing code enabled, code: ' + pairingCode);
            console.log('Number: ' + '558491097019');
            pairingCodeRequested = true;
        }
    });

    bot.on('authenticated', () => {
        console.log('AUTHENTICATED');
        initListeners();
    });

    bot.on('auth_failure', msg => {
        // Fired if session restore was unsuccessful
        console.error('AUTHENTICATION FAILURE', msg);
    });

    bot.on('ready', async () => {
        console.log('READY');
        const debugWWebVersion = await bot.getWWebVersion();
        console.log(`WWebVersion = ${debugWWebVersion}`);

        bot.pupPage.on('pageerror', function (err) {
            console.log('Page error: ' + err.toString());
        });
        bot.pupPage.on('error', function (err) {
            console.log('Page error: ' + err.toString());
        });

    });
    return bot;
}

function botListener() {
    try {
        bot.on('message_create', async (msg) => {

            if (msg.body.includes('!tv') || msg.body.includes('!home')) {
                let text = msg.body.replace('!', '');
                let [topic, value] = text.split(' ');
                clientMqtt.publish(topic, value);
            }

        });
    } catch (e) {
        console.error(e);
    }

}

function clientMqttListener() {
    clientMqtt.subscribe(topic_whatsapp, (err) => {
        if (!err) {
            console.log('subscribed to', topic_whatsapp)
        } else {
            console.error(err)
        }
    })

    clientMqtt.on('message', async (topic, message) => {
        const sanitized_number = my_phone.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
        const final_number = `55${sanitized_number.substring(sanitized_number.length - 11)}`; // add 91 before the number here 91 is country code of India

        const number_details = await bot.getNumberId(final_number);

        console.log('received message "%s" from topic "%s"', message, topic)
        if (number_details) {
            const sendMessageData = await bot.sendMessage(number_details._serialized, `${message}`); // send message
        } else {
            console.log(final_number, "Mobile number is not registered");
        }

    });
}

function initListeners() {
    botListener(bot, clientMqtt);
    clientMqttListener(clientMqtt, bot);
}

async function initBotWhatsapp() {
    clientMqtt = await initClientMqtt();
    bot = await initBotClient();
}

initBotWhatsapp().catch((err) => {console.log(err)});