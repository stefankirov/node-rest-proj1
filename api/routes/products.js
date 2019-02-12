const express =require('express');
const router = express.Router();

//import and initialize multer for file upload
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toDateString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    //allow only jpeg and png files. 
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    }
    
   
};

const upload = multer({
    storage:storage, 
    limits: {
    fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

//import Schema db
const mongoose = require('mongoose');
const Product = require('../models/product');

//https requests
//const https = require('https');

router.get('/', (req, res, next) => {
    Product
    .find()
    .select('name price _id productImage')  //selecting what data to fetch
    .exec()
    .then(docs => {
        //console.log(docs);
        //preparing our more useful response
        res.status(200).json({
                count: docs.length,
                products: docs.map(doc => {
                    return{
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id //e.g. dynamicaly can setup this as you wish
                        }
                    }
                })
            });
        //add check to handle scenarios with results & no results
        // if (docs.length >= 0){          
        // }else{
        //     res.status(404).json(
        //         {
        //             message: "No entries found"
        //         }
        //     );
        // }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
           error: err 
        });
    });
 
});


router.post('/', upload.single('productImage'), (req,res,next) => {
    console.log(req.file);
    console.log(mongoose.connection.readyState);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
        //console.log(result);
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
    })
    .catch(err => {
        console.log(err);
        //error response
        res.status(500).json({error: err});
    });

   
    console.log(mongoose.connection.readyState);
});

router.get('/:productId', (req, res, next) => {
    console.log(mongoose.connection.readyState);
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')  //selecting what dtata to fetch
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
            res.status(404).json({message: "No valid entry provided for id"});
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
       console.log(result);
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
    Product
        .deleteOne({_id: id})
        .exec()
        .then(result => {
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