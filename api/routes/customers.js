/* This whole file is TODO POC for another project */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const https = require('https');

const auroraTpwsBaseUrl = 'https://auroraws-dev.mgmresorts.local/tpws/';

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: "",
        requests: 
        [
            {
            description: 'Get Customer Information By GSE Id',
            type: 'GET',
            //https://auroraws-dev.mgmresorts.local/tpws/customer/getById?request={%22customerId%22:%22697255985409%22}
            url: 'http://localhost:3000/customers/getById/{customerId}' 
            },
            {
            description: 'Get Customer Promotions',
            type: 'GET',
            //https://staging-content.mgmresorts.com/content-api/v1/en/property/detail/ + id
            //url: 'http://localhost:3000/content/getPropertyid/' + roomRes.propertyId
            //url: 'https://staging-content.mgmresorts.com/content-api/v1/en/property/detail/'  
            url: "Some sample Url here"
            }
        ]
    });
});
 
router.get('/getById/:id', (req, res, next) => {
    //to make it work locally
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    const id = req.params.id;
    const requestUrl = auroraTpwsBaseUrl + 'customer/getById?request={"customerId":"' + id +'"}';
    if (id === "") {
        res.status(200).json({
            message: 'You passed an empty ID',
        });
    } else {
        https.get(requestUrl, (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                try {
                //catching aurora error   
                if (data.slice(0,1) == "<"){
                    return res.status(500).json({
                        error: data
                    })
                }  
                let responseData = JSON.parse(data).customer;
                res.status(200).json({
                    id: responseData.id,
                    mlifeNo: responseData.mlifeNo,
                    firstName: responseData.firstName,
                    lastName: responseData.lastName,
                    addresses: responseData.addresses
                });
            }catch(err) {
                res.status(500).json({
                    error: err,
                    message: 'Error parsing response data'
                })
            }

            });
        }).on("error", (err) => {
            console.log("Error: " + err + ". Request to aurora -->: " + requestUrl);
            res.status(500).json({
                error: err,
                message: 'Error'
            });
        });
    }
});


router.get('/getById/:id', (req, res, next) => {
      
});

module.exports = router;