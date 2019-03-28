const rp = require('request-promise-native');

const apiKey = "d44819fb-17f0-4f32-9d6e-6625388e10e4";
const URL = "https://api.cdiscount.com/OpenApi/json";

apiCdiscount = {
    searchProducts: function (keyword, brands) {
        console.log("keyword : "+keyword+" ; brands : "+ brands);
        let options = {
            uri: `${URL}/Search`,
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                "ApiKey": apiKey,
                "SearchRequest": {
                    "Keyword": keyword,
                    "SortBy": "relevance",
                    "Pagination": {
                        "ItemsPerPage": 5,
                        "PageNumber": 0
                    },
                    "Filters": {
                        "Price": {
                            "Min": 0,
                            "Max": 0
                        },
                        "Navigation": null,
                        "IncludeMarketPlace": false,
                        "Brands": brands,
                        "Condition": null
                    }
                }
            }
        };
        return rp(options);
    },

    pushToCart: function (productId, quantite) {
        let options = {
            uri: `${URL}/PushToCart`,
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                "ApiKey": apiKey,
                "PushToCartRequest": {
                    "OfferId": "",
                    "ProductId": productId,
                    "Quantity": quantite,
                    "SellerId": ""
                }
            }
        };
        return rp(options);
    },

    getCart: function (cartGUID) {
        let options = {
            uri: `${URL}/GetCart`,
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
            },
            body: {

                "CartRequest": {
                    "CartGUID": "333"
                }
            }
        };
        return rp(options);
    }
};


module.exports = apiCdiscount;