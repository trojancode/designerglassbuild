const express = require('express');
const router = express.Router();


const { productById,} = require('../controllers/product');
const { photoById,read,photobyProductid, create, remove} = require('../controllers/photo');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');


router.get('/products/photo/:photoId/', read);
router.get('/products/photo0/:productId/', photobyProductid);
router.post('/products/photo/:userId/:productId/', requireSignin, isAuth, isAdmin, create);
router.delete('/products/photo/:userId/:productId/:photoId/',requireSignin, isAuth, isAdmin, remove);


router.param("userId", userById);
router.param("productId", productById);
router.param("photoId", photoById);



module.exports = router;