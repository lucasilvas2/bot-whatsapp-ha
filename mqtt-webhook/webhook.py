from flask import Flask, request, jsonify
import paho.mqtt.client as mqtt
from dotenv import load_dotenv, dotenv_values
load_dotenv()
app = Flask(__name__)
THE_BROKER = '192.168.180.13'
CLIENT_ID = ""

@app.route('/webhook', methods=['POST'])
def webhook_receiver():
    data = request.json  # Extract JSON data from the request
    client = init_publisher_client()
    publisher_message(client, data.get("topic"), data.get("value"))
    print("Received webhook data:", data)
    return jsonify({'message': 'Webhook received successfully'}), 200


def on_connect(client, userdata, flags, rc):
    print("Connected to ", client._host, "port: ", client._port)
    print("Flags: ", flags, "returned code: ", rc)


def on_publish(client, userdata, mid):
    print("sipub: msg published (mid={})".format(mid))


def init_publisher_client():
    client = mqtt.Client(client_id=CLIENT_ID,
                         clean_session=True,
                         userdata=None,
                         protocol=mqtt.MQTTv311,
                         transport="tcp")

    client.on_connect = on_connect
    client.on_publish = on_publish

    client.username_pw_set(None, password=None)
    client.connect(THE_BROKER, port=1883, keepalive=60)
    return client


def publisher_message(client, topic, msg, qos=0, retain=False):
    client.publish(topic,
                   payload=msg,
                   qos=qos,
                   retain=retain)


if __name__ == '__main__':
    app.run(debug=True)
