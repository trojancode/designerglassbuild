const express = require('express');
const router = express.Router();


const { requireSignin, isAuth, isAdmin, isDBoy } = require('../controllers/auth');
const { userById, read, update, dboyOrders, getgetDboyDetails, dBoyById, listDboy, makeDboy, fireDboy, getDboyCurrentOrder, nextCurrentOrder, dboyOrdersDeliveredorCancelled } = require('../controllers/user');
const { getStatusValues, orderById, updateorderStatus, isDBoySame } = require('../controllers/order');

router.get('/dboy/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    })
});

router.get('/dboy/:userId', requireSignin, isAuth, isDBoy, read);
router.get('/dboy/list/:userId', requireSignin, isAuth, listDboy);
router.put('/dboy/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/dboy/details/:userId/:dboyId', requireSignin, isAuth, getgetDboyDetails)

router.put('/dboy/products/:orderId/status/:userId', requireSignin, isAuth, isDBoy, isDBoySame, updateorderStatus)
router.get('/dboy/products/status-values/:userId', requireSignin, isAuth, isDBoy, getStatusValues)

router.get('/dboy/orders-notdel/:userId', requireSignin, isAuth, isDBoy, dboyOrders);
router.get('/dboy/orders-delcan/:userId', requireSignin, isAuth, isDBoy, dboyOrdersDeliveredorCancelled);
router.get('/dboy/currentorder/:userId', requireSignin, isAuth, isDBoy, getDboyCurrentOrder)
router.post('/dboy/nextcurrentorder/:userId', requireSignin, isAuth, isDBoy, nextCurrentOrder)


router.put('/dboy/make/:userId/', requireSignin, isAuth, isAdmin, makeDboy)
router.put('/dboy/fire/:userId/', requireSignin, isAuth, isAdmin, fireDboy)


router.param("userId", userById);
router.param("dboyId", dBoyById);
router.param('orderId', orderById);


module.exports = router;