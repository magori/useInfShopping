const express = require('express');
const apiCdiscount = require('./apiCdiscount');
const {WebhookClient} = require('dialogflow-fulfillment');
//const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function WebhookProcessing(request, response) {
    const agent = new WebhookClient({request, response});
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    let variables = {};

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function commande(agent) {
        variables["typeCafe"] = agent.parameters['Type_de_cafe'];
        variables["accompagnement1"] = agent.parameters['Accompagnement'];
        variables["accompagnement2"] = agent.parameters['Accompagnement1'];
        variables["number"] = (agent.parameters['number'] ? agent.parameters['number'] : 1);
        variables["number1"] = agent.parameters['number1'];
        variables["grandeur"] = agent.parameters['Grandeur'];
        let message = (variables.number ? variables.number : "un ") +
            (variables.grandeur ? " " + variables.grandeur + " " : "") +
            variables.typeCafe + " test8 " +
            (variables.number1 ? " " + variables.number1 : "") +
            (variables.accompagnement1 ? "avec " + variables.accompagnement1 : "") +
            (variables.accompagnement2 ? " et " + variables.accompagnement2 : "");
        return apiCdiscount.searchProducts("tablette").then((body) => {
            console.log(body)
            agent.add(`Nous allons commander ${message} vous les vous le payer maitenant 99?`)
        });
    }

    function payement(agent) {
        agent.add('Merci de faire votre commande avant le payement' + agent.getContext());
        /* if(variables && variables.typeCafe){
          let montantCafe = 3;
          if(variables.grandeur == 'grand') {
                montantCafe = 3.5;
          }
          const montant = variables.number * montantCafe;
          agent.add(`La facture est de ${montant}, pour ${montant} café coute ${montantCafe}`);

        } else {
           agent.add(`Merci de faire votre commande avant le payement`);
        }*/
    }

    function fallback(agent) {
        return apiCdiscount.searchProducts("tablette").then(body => {
            console.log(body)
            agent.add(`I didn't understand3333`);
        });
    }

    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    //   agent.add(new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: 'This is a button',
    //       buttonUrl: 'https://assistant.google.com/'
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    // }

    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Commande', commande);
    intentMap.set('Payement', payement)
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
}


// Webhook
app.post('/', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessing(req, res);
});



module.exports = app;
