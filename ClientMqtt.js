const mqtt = require('mqtt');

class ClientMqtt {
    constructor(broker, options) {
        this.broker = broker;
        this.options = options;
    }

    init(){
        let clientMqtt = mqtt.connect(`mqtt://${this.broker}`, this.options);
        clientMqtt.on("connect", () => {
            clientMqtt.subscribe("presence", (err) => {
                if (!err) {
                    clientMqtt.publish("presence", "Hello mqtt");
                }
            });
        });
        return clientMqtt;
    }
}

module.exports = ClientMqtt;