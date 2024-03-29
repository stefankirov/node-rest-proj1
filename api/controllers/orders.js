
const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.orders_get_all = (req, res, next) => {
    //find all orders - pass object for query criteria inside find
    //select only the columns you want back
    Order.find()
    .select('product quantity _id')
    .populate('product','name') //chaining populating of data for the refernce property PRODUCT. e.g. getting  some info from product table. 
    .exec() 
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') + '/orders/' + doc._id
                    }
                }
            })
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
}

exports.orders_create_order = (req,res,next) => {
    //before adding an order check if product exists
    Product.findById(req.body.productId)
         .then(product => {
           if (!product) {
                return res.status(404).json({
                    mesaage: 'Product Not found'
                })
            }
            //create & save order
            const order = new Order ({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
             return order.save();
                
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Order stored',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: req.protocol + '://' + req.get('host') + '/orders/' + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        }); 
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product') //chaining populating of data for the refernce property PRODUCT. e.g. getting  some info from product table. 
    .exec()
    .then(order => {
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: req.protocol + '://' + req.get('host') + '/orders'
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });    
}

exports.order_delete_order = (req, res, next) => {
    Order.remove({_id: req.params.orderId})
    .exec()
    .then(result => {
        if (!order) {
            return res.status(404).json({
                message: 'Cannot delete. Order Not found'
            });
        }
        res.status(200).json({
            message: 'Order Deleted',
            request : {
                type: 'POST',
                url: req.protocol + '://' + req.get('host') + '/orders',
                body: { productId: 'ID', quantity: 'Number' }
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
}