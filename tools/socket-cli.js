// https://nodejs.org/en/knowledge/command-line/how-to-prompt-for-command-line-input/

const dotenv = require('dotenv');
const WebSocket = require('ws');
const readline = require("readline");
const axios = require('axios');

dotenv.config();

// curl --location --request POST 'https://localhost:8000/auth' \
//     --header 'Content-Type: application/json' \
//     --data-raw '{
//        "accountId": "user1",
//        "password": "asldkfj"
//      }'

async function getToken() {
    if (process.env.TOKEN) {
        return process.env.TOKEN;
    } else if (process.env.AUTH_URL && process.env.ACCOUNTID && process.env.PASSWORD) {
        return new Promise((resolve, reject) => {
            axios.post(process.env.AUTH_URL, {
                accountId: process.env.ACCOUNTID,
                password: process.env.PASSWORD
            },
            {
                headers: { 'Content-Type': 'application/json'}
            })
                .then(function (response) {
                    // console.log(response);
                    resolve(response.data.access_token);
                })
                .catch(function (error) {
                    console.log(error);
                    reject();
                });

        });
    } else {
        return '';
    }
}

function connect(token) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(`URL:`, process.env.URL);
    // console.log('token:', token);
    const ws = new WebSocket(process.env.URL, { headers: { Authorization: `Bearer ${token}` } })

    ws.on('open', () => {
        console.log('client connected');
        console.log('ctrl-c to quit');
        ask("> ");
    });

    ws.on('close', () => {
        console.log('client closed');
        rl.close();
    });

    ws.on('error', (error) => {
        console.log(error);
    });

    ws.on('message', function incoming(message) {
        let output = message;
        try {
            const messageObj = JSON.parse(message);
            output = JSON.stringify(messageObj, null, 2);
            output += '\n\n';
            const best = messageObj[0];
            output += `label: ${best.label.name}, closest_text: ${best.closest_text}, score: ${best.score}, processingTime: ${best.processingTime} ms`;
        } catch {
            //
        }
        console.log(`${output}`);
        ask("> ");
    });

    const ask = (prompt) => {
        rl.question(prompt, function (input) {
            const messageData = input;
            ws.send(messageData);
        });
    }

    rl.on("close", function () {
        console.log("\nBYE BYE !!!");
        process.exit(0);
    });
}

async function doIt() {
    const token = await getToken();
    connect(token);
}

doIt();