/* API to use the Microsoft Azure Entity Search */

const express = require('express');
const router = express.Router();
//const mongoose = require('mongoose');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
const EntitySearchAPIClient = require('azure-cognitiveservices-entitysearch');

let credentials = new CognitiveServicesCredentials("3443cc2f77f244ccb4a1f6789b659470"); //process.env.BING_COGNITIVE_SERVICES_KEY
let entitySearchApiClient = new EntitySearchAPIClient(credentials);

router.get('/:query', (req, res, next) => {
    let queryText = req.params.query;
    if (queryText == "") {
        res.status(200).json({
            message: 'You passed an empty query',
        });
    } else {
        entitySearchApiClient.entitiesOperations
        .search(queryText)
        .then((result) => {
            console.log(result.queryContext);
            //console.log(result.entities.value);
            //console.log(result.entities.value[0].description);
            if (result.entities) {
                res.status(200).json({
                    data: result.entities,
                    length: result.entities.value ? result.entities.value.length : 0
                });
            } else {
                res.status(404).json({message: "Search criteria did not return any results"});
            }
        }).catch((err) => {
            throw err;
        });
    }
});


module.exports = router;