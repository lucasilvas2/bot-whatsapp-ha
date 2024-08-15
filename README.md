# Whatsapp Bot

Bot no whatsapp criado para controlar dispositivos integrados ao Home assistant, utilizando protocolo Mqtt.

## Iniciando o projeto

- Baixe os pacotes necessários
    ```bash
        $ npm install
    ```
- Incializando o docker
    ```bash
        $ docker-compose up --build -d
    ```
- Identifique o ip da sua máquina
    1. Windows:
       ```bash
       $ ipconfig
        ```
    2. Linux:
          ```bash 
            $ ifconfig
        ```
- Acesse o [Home Assitant](http://localhost:8123) e realiza a configuração básica
- Duplique o .env.example e altere o nome do novo arquivo para .env preenchendo com as informações:
    1. IP_BROKER: ip da sua máquina
    2. MY_LIST_PHONE_NUMBER: lista de telefones com dd e separado por vírgula
    3. TOPIC_WHATSAPP: tópico para receber mensagens para enviar para lista de telefones
    4. TOPIC_SENSOR: tópico para simular o sensor de temperatura
- Incialize o Bot:
    ```bash
        npm start
    ```