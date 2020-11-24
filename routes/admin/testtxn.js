const express = require('express');
const router = express.Router();
const { requireSignin, isAuth } = require('../../controllers/auth');
const {ProcessPayment,orderById,executePayment} = require('../../controllers/order')
const { userById} = require('../../controllers/user');


router.post('/user/:userId/order/pay/:orderId/makepayment', ProcessPayment);

router.post('/user/orderpaid/response', executePayment);
  
router.param('userId', userById)
router.param('orderId', orderById)

module.exports = router