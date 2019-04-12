const express = require('express');
const apiCdiscount = require('./apiCdiscount');
const {WebhookClient, Card, Suggestion} = require('dialogflow-fulfillment');

const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function WebhookProcessing(request, response) {
    const agent = new WebhookClient({request, response});
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Bienvenue to Florian and Dorian my agent! Il est possible de changer l'ordre d'affichage en demandant: 
        Order par prix min, prix max ou évaluation`);
    }

    function searchProductsToDisplay(agent, product, brand, pageNumber, order, budgetMin, budgetMax) {
        return apiCdiscount.searchProducts(product, brand, pageNumber, order, budgetMin, budgetMax).then((body) => {
            if (body.Products) {
                let message = " Voici les produits que nous avons trouvé pour "+product;
                if (!brand) {
                    agent.add(`Vous n'avez pas sépcifié la marque dans votre recherche. Si vous voulez être plus précis merci de l'indiquer`)
                } else {
                    message = message + " de marque " + brand;
                }
                if (!budgetMax) {
                    agent.add(`Vous pouvez définir un budget pour trouver votre produit, il sufit de demander: Mon budget est de 1200, par exemple`);
                } else {
                    message = message + " avec un budget max de " + budgetMax
                }
                agent.add(message);

                var liste_Card = [];
                body.Products.forEach(product => {
                    liste_Card.push(new Card({
                        title: product.Name,
                        imageUrl: product.MainImageUrl,
                        text: "Prix: " + product.BestOffer.SalePrice,
                        buttonText: 'Voir sur le site',
                        buttonUrl: 'https://www.cdiscount.com/mp-1-' + product.Id + '.html'
                    }));
                });
                console.log(liste_Card);
                agent.add(liste_Card);
                agent.add(`Les 5 premiers produits sont affichés. Voulez-vous en afficher d'autres ? `);
                agent.add(new Suggestion(`Oui`));
                agent.add(new Suggestion(`Non`));
                agent.setContext({
                    name: 'produit',
                    lifespan: 2,
                    parameters: {
                        product: product,
                        brand: brand,
                        pageNumber: pageNumber + 1,
                        order: order,
                        budgetMin: budgetMin,
                        budgetMax: budgetMax
                    }
                });
            } else {
                agent.add(`Aucun produit n'a été trouvé !`);
            }
        });
    }

    function Search(agent) {
        const product = agent.parameters['Product_type'];
        let brand = agent.parameters['Marque'];
        let pageNumber = 0;
        if (agent.getContext("produit")) {
            pageNumber = agent.getContext("produit").parameters.pageNumber;
        }
        if (product && brand) {
            console.log("launch request with brand");
        } else if (product) {
            brand = "";
            console.log("launch request with product");
        }
        return searchProductsToDisplay(agent, product, brand, pageNumber, resolveOrder(agent))
    }

    function searchOrder(agent) {
        let order = agent.parameters['Ordre'];
        agent.setContext({
            name: 'produit_order',
            lifespan: 10000,
            parameters: {order: order}
        });

        const contextProduit = agent.getContext("produit");
        if (contextProduit) {
            const pageNumber = contextProduit.parameters.pageNumber;
            const product = contextProduit.parameters.product;
            const brand = contextProduit.parameters.brand;
            const budgetMin = contextProduit.parameters.budgetMin;
            const budgetMax = contextProduit.parameters.budgetMax;
            return searchProductsToDisplay(agent, product, brand, pageNumber, order, budgetMin, budgetMax)
        }
        //fallback(agent);
    }

    function searchNextProduct(agent) {
        const contextProduit = agent.getContext("produit");
        let answer = agent.parameters['OuiNon'];
        if(answer == 'Oui'){
            if (contextProduit) {
                const pageNumber = contextProduit.parameters.pageNumber;
                const product = contextProduit.parameters.product;
                const brand = contextProduit.parameters.brand;
                const budgetMin = contextProduit.parameters.budgetMin;
                const budgetMax = contextProduit.parameters.budgetMax;
                return searchProductsToDisplay(agent, product, brand, pageNumber, resolveOrder(agent), budgetMin, budgetMax);
            }
        }
        //fallback(agent)
    }

    function searchByBudget(agent) {
        let budgetMin = agent.parameters['number'];
        let budgetMax = agent.parameters['number1'];
        if (!budgetMax) {
            budgetMax = budgetMin;
            budgetMin = 0;
        }
        const contextProduit = agent.getContext("produit");
        if (contextProduit) {
            const pageNumber = contextProduit.parameters.pageNumber;
            const product = contextProduit.parameters.product;
            const brand = contextProduit.parameters.brand;
            return searchProductsToDisplay(agent, product, brand, pageNumber, resolveOrder(agent), budgetMin, budgetMax);
        }
        //fallback(agent)
    }

    function resolveOrder(agent) {
        const produitOrderContext = agent.getContext("produit_order");
        let order;
        if (produitOrderContext) {
            order = produitOrderContext.parameters.order;
        }
        return order;
    }

    function fallback(agent) {
        agent.add(`Je n'ai pas compris !`);
    }

    let intentMap = new Map();

    //intentMap.set('Default Welcome Intent', welcome);
    //intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('recherche de produit', Search);
    intentMap.set("OrdrerProduit", searchOrder);
    intentMap.set('OuiNon', searchNextProduct);
    intentMap.set("Budget", searchByBudget)
    agent.handleRequest(intentMap);
}

// Webhook
app.post('/', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessing(req, res);
});

module.exports = app;
