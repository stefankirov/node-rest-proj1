/* This whole file is TODO POC for another project */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');

//https requests
const https = require('https');

//reference
//M0221E3E1
//const customerSearchById = "https://auroraws-dev.mgmresorts.local/tpws/customer/search?request={%22key%22:{%22mlifeNo%22:%2274068246%22,%22cacheOnly%22:false}}";
//const customerSearchByMlifeNo = "https://auroraws-dev.mgmresorts.local/tpws/customer/search?request={key:{mlifeNo:74068246,cacheOnly:false}}";
//const getItineraryByConfirmationNumber = 'https://auroraws-dev.mgmresorts.local/tpws/customer/itineraryByRoomConfirmationNumber?request={"confirmationNumber":"' + id +'","cacheonly":false}';
//const customerSearchById = "https://auroraws-dev.mgmresorts.local/tpws/customer/search?request={%22key%22:{%22mlifeNo%22:%2274068246%22,%22cacheOnly%22:false}}";
//const customerSearchByMlifeNo = "https://auroraws-dev.mgmresorts.local/tpws/customer/search?request={key:{mlifeNo:74068246,cacheOnly:false}}";
//const getItineraryByConfirmationNumber = 'https://auroraws-dev.mgmresorts.local/tpws/customer/itineraryByRoomConfirmationNumber?request={"confirmationNumber":"' + id +'","cacheonly":false}';

//all this should be configurable 
const auroraTpwsBaseUrl = 'https://auroraws-dev.mgmresorts.local/tpws/'

router.get('/', (req, res, next) => {
    res.status(200).json({
        message : 'Handling GET requests to itineraries'
    });
});

router.get('/:confNo', (req, res, next) => {
    //to make it work locally
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    const id = req.params.confNo;
    const requestUrl = auroraTpwsBaseUrl + 'customer/itineraryByRoomConfirmationNumber?request={"confirmationNumber":"' + id +'","cacheonly":false}';
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
                let responseData = JSON.parse(data).itinerary;
                res.status(200).json({
                    roomReservationsCount: responseData.roomReservations.length,
                    customerId: responseData.customerId,
                    roomReservations: responseData.roomReservations.map(roomRes => {
                        return {
                            id: roomRes.id,
                            checkInDate: moment(new Date(roomRes.checkInDate)).format('MM-DD-YYYY'),
                            checkOutDate: moment(new Date(roomRes.checkOutDate)).format('MM-DD-YYYY'),
                            propertyId: roomRes.propertyId,
                            bookings: roomRes.bookings,
                            requests: 
                            [
                                {
                                description: 'Get Customer Information',
                                type: 'GET',
                                //https://auroraws-dev.mgmresorts.local/tpws/customer/getById?request={%22customerId%22:%22697255985409%22}
                                url: 'http://localhost:3000/customers/getById/' + responseData.customerId
                                },
                                {
                                description: 'Get Property Information',
                                type: 'GET',
                                //https://staging-content.mgmresorts.com/content-api/v1/en/property/detail/ + id
                                //url: 'http://localhost:3000/content/getPropertyid/' + roomRes.propertyId
                                url: 'https://staging-content.mgmresorts.com/content-api/v1/en/property/detail/' + roomRes.propertyId
                                },
                                {
                                    description: 'Get Room Information',
                                    type: 'GET',
                                    //https://staging-content.mgmresorts.com/content-api/v1/en/property/detail/ + id
                                    //url: 'http://localhost:3000/content/getPropertyid/' + roomRes.propertyId
                                    url: 'https://staging-content.mgmresorts.com/content-api/v1/en/room/detail/' + roomRes.propertyId + '/' + roomRes.roomTypeId
                                    }     
                            ]
                        }
                    })          
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

router.get('/:getByCustomerId', (req, res, next) => {
   //not implemented
 
});
 

module.exports = router;

 