const express = require('express');
const router = express.Router();


const { productById,} = require('../controllers/product');
const { prescriptionfileById,read,create} = require('../controllers/prescriptionfile');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');


router.get('/prescriptionfile/:prescriptionfileId/:userId/',requireSignin, isAuth, isAdmin, read);
router.post('/prescriptionfile/:userId/',requireSignin, isAuth, create);


router.param("userId", userById);
router.param("productId", productById);
router.param("prescriptionfileId", prescriptionfileById);



module.exports = router;