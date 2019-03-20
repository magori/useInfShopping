const express = require('express');
const apiCdiscount = require('./apiCdiscount');
const {WebhookClient} = require('dialogflow-fulfillment');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function WebhookProcessing(request, response) {
    const agent = new WebhookClient({request, response});
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function commande(agent) {
        return apiCdiscount.searchProducts("tablette").then((body) => {
            console.log(body);
            agent.add(`Nous allons commander ?`)
        });
    }

    function fallback(agent) {
        return apiCdiscount.searchProducts("tablette").then(body => {
            console.log(body);
            agent.add(`I didn't understand3333`);
        });
    }
    let intentMap = new Map();

    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Commande', commande);
    agent.handleRequest(intentMap);
}

// Webhook
app.post('/', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessing(req, res);
});

module.exports = app;
