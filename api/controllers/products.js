const Product = require('../models/product');
const mongoose = require('mongoose');

exports.products_get_all  = (req, res, next) => {
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
                            url: req.protocol + '://' + req.get('host') + '/products/' + doc._id,
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
}

exports.products_create_product = (req,res,next) => {
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
                    url: req.protocol + '://' + req.get('host') +  '/products/' + result.id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        //error response
        res.status(500).json({error: err});
    });
}

exports.products_get_product = (req, res, next) => {
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
                    url: req.protocol + '://' + req.get('host') + '/products'     
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
}

exports.products_update_product = (req, res, next) => {
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
                url: req.protocol + '://' + req.get('host') + '/products/' + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })     
}

exports.products_delete_product = (req, res, next) => {
    const id = req.params.productId;
     Product
         .deleteOne({_id: id})
         .exec()
         .then(result => {
             res.status(200).json({
                 message: 'Product Deleted',
                 request: {
                     type: 'POST',
                     url: req.protocol + '://' + req.get('host') + '/products',
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
 }