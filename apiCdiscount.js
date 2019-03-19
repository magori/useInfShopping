const rp = require('request-promise-native');

const apiKey = "d44819fb-17f0-4f32-9d6e-6625388e10e4";

apiCdiscount = {
    searchProducts: function (keyword, brands) {
        let options = {
            uri: "https://api.cdiscount.com/OpenApi/json/Search",
            method: 'POST',
            json: true,
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
                        "Navigation": "computers",
                        "IncludeMarketPlace": false,
                        "Brands": brands,
                        "Condition": null
                    }
                }
            },
            headers: {
                'Content-Type': 'application/json',
            },
        };
        return rp(options);
    },
};


module.exports = apiCdiscount;