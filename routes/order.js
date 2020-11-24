const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isAdmin, isDBoy, verifyDeliveryOtp } = require('../controllers/auth');
const { userById, addOrderToUserHistory, updateUserAddress } = require('../controllers/user');
const { create,
    listOrders,
    getStatusValues,
    orderById,
    updateorderStatus,
    assignOrderDboy,
    isDBoySame,
    listOrdersNotDelivered,
    listOrdersProcessing,
    listOrdersDeliveredCancelled,
    createCOD, verifyPayment } = require('../controllers/order');
const { decreaseQuantity, isPincodeAvail, isStockAvail } = require('../controllers/product');
const { calculate_vision_price } = require('../controllers/vision');
const { sentDeliveryOTP } = require('../helpers/otpHelper')

router.post('/order/create/:userId', requireSignin, isAuth, isPincodeAvail, updateUserAddress, isStockAvail, decreaseQuantity, create)
router.post('/order/verify/:userId/', requireSignin, isAuth, verifyPayment)
router.post('/order/create/COD/:userId', requireSignin, isAuth, isPincodeAvail, updateUserAddress, isStockAvail, decreaseQuantity, createCOD)
router.get('/order/list/:userId', requireSignin, isAuth, isAdmin, listOrders)

router.get('/order/list/notdelivered/:userId', requireSignin, isAuth, isAdmin, listOrdersNotDelivered)
router.get('/order/list/delcancel/:userId', requireSignin, isAuth, isAdmin, listOrdersDeliveredCancelled)
router.get('/order/list/processing/:userId', requireSignin, isAuth, isAdmin, listOrdersProcessing)

router.get('/order/status-values/:userId', requireSignin, isAuth, isAdmin, getStatusValues)
router.get('/order/dboy/status-values/:userId', requireSignin, isAuth, isDBoy, getStatusValues)

router.put('/order/dboy/:orderId/status/:userId', requireSignin, isAuth, isDBoy, updateorderStatus)

router.put('/order/:orderId/status/:userId', requireSignin, isAuth, isAdmin, updateorderStatus) //admin update status
router.put('/order/:orderId/dboy/:userId', requireSignin, isAuth, isAdmin, assignOrderDboy) //assign new order to del boy

router.post('/order/:orderId/dboy/:userId/requestDelOTP', requireSignin, isAuth, isDBoy, isDBoySame, sentDeliveryOTP)
router.post('/order/:orderId/dboy/:userId/verifyDelOtp', requireSignin, isAuth, isDBoy, isDBoySame, verifyDeliveryOtp)


router.param('userId', userById)
router.param('orderId', orderById)

module.exports = router