const express =require('express');
const router = express.Router();


//import Schema db
const mongoose = require('mongoose');
const Product = require('../models/product');

//https requests
const https = require('https');

router.get('/', (req, res, next) => {
Product.find()
    .select('name, price, _id')  //selecting what data to fetch
    .exec()
    .then(docs => {
        //console.log(docs);
        //preparing our more useful response
        const response = {
            count: docs.length,
            products: docs.map()(doc => {
                return{
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc._id //e.g. dynamicaly can setup this as you wish
                    }
                }
            })
        };

        //add check to handle scenarios with results & no results
        // if (docs.length >= 0){          
        // }else{
        //     res.status(404).json(
        //         {
        //             message: "No entries found"
        //         }
        //     );
        // }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
           error: err 
        });
    });
 
});


router.post('/', (req,res,next) => {
 /*    const product = {
        name: req.body.name,
        price: req.body.price
    }; */
    console.log(mongoose.connection.readyState);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
        .then(result => {
        console.log(result);
    })
    .catch(err => {
        console.log(err)
    });

    res.status(201).json({
        message : 'Created product Successfully',
        createdProduct: {
            name: result.name,
            price: result.price,
            _id: result.id,
            request : {
                type: "GET",
                url: "http://localhost:3000/products/" + result.id
            }
        }
    });
    console.log(mongoose.connection.readyState);
});

router.get('/:productId', (req, res, next) => {
    console.log(mongoose.connection.readyState);
    const id = req.params.productId;
    Product.findById(id)
    .select('name, price, _id')  //selecting what dtata to fetch
    .exec()
    .then(doc => {
        console.log("From Database", doc);
        if(doc){
        //success
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'GET_ALL_PRODUCTS',
                    url: 'http://localhost:3000/products'     
                }
            });
        }else {
            res.status(404).json({messgae: "No valid entry provided for id"});
        }

    })
    .catch(err => {
        console.log(err);
        //error response
        res.status(500).json({error: err});
    });
 
    console.log(mongoose.connection.readyState);
 
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps })
    .exec()
    .then(result => {
       //console.log(result);
        res.status(200).json({
            message: 'Product Updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })     
});

router.delete('/:productId', (req, res, next) => {
   const id = req.params.productId;
    Product.remove({_id: id})
        .exec()
        .then(res =>{
            res.status(200).json({
                message: 'Product Deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    data: {name: 'String', price: 'Number'}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});

 

module.exports = router;


 //remove this - not secure
 /*        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        https.get('https://auroraws-dev.mgmresorts.local/tpws/customer/itineraryByRoomConfirmationNumber?request={"confirmationNumber":"M02871502",%20"cacheonly":false}', (resp) => {
            let data = '';
          
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
              data += chunk;
            });
          
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
              console.log(JSON.parse(data).itinerary);
              let responseData = JSON.parse(data).itinerary;
                res.status(200).json({
                    itinerary: responseData,
        
                });
            });
          
          }).on("error", (err) => {
            console.log("Error: " + err.message);
          }); */
        