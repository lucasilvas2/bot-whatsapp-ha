const mqtt = require('mqtt');
const dotenv = require('dotenv');
dotenv.config();
let clientMqtt = null;
let sensorActive = false;
const ip_broker = process.env.IP_BROKER;
const topic_sensor = process.env.TOPIC_SENSOR;
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

start();
function start() {
    sensorActive = true;
    clientMqtt = initClientMqtt();
    setInterval(() =>{
        if (sensorActive) {
            let temperature = sensor();
            let unit_of_measurement = "°C";
            console.log(temperature);
            clientMqtt.publish(topic_sensor, JSON.stringify({ temperature,unit_of_measurement }));
        }
    }, 1000);
}

function sensor() {
    let randomValue = Math.random();

    let randomTemp = randomValue * 100;

    let adjustedTemp = randomTemp - 20;

    return  Math.round(adjustedTemp);
}