const express = require('express');
const router = express.Router();


const { productById,} = require('../controllers/product');
const { photoById,read} = require('../controllers/photo');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');


router.get('/products/photo/:photoId/', read);


router.param("userId", userById);
router.param("productId", productById);
router.param("photoId", photoById);



module.exports = router;