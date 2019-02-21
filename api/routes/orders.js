const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth')

const OrderesController = require('../controllers/orders');

router.get('/', checkAuth, OrderesController.orders_get_all);

router.post('/', checkAuth, OrderesController.orders_create_order);

router.get('/:orderId', checkAuth, OrderesController.orders_get_order);

router.delete('/:orderId', checkAuth, OrderesController.order_delete_order);
 

module.exports = router;