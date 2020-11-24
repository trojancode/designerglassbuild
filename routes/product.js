const express = require('express');
const router = express.Router();


const { create, productById, read, remove, update, list, addVarient, listRelated, listCategories, listBySearch, listReview,addReview, listSearch, listByCategory, removeVarient, listVarients } = require('../controllers/product');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { isAlreadyBuyyed } = require('../controllers/order');
const { userById } = require('../controllers/user');



router.get('/product/:productId', read);
router.post('/product/create/:userId', requireSignin, isAuth, isAdmin, create);

router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin, remove)

router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update);

router.get('/products', list);
router.post('/products/by/categories', listByCategory);
router.get('/products/search', listSearch);
router.get('/products/related/:productId', listRelated);
router.get('/products/categories', listCategories);
router.post('/products/by/search', listBySearch);
// router.get('/products/photo/:productId/', photo);
// router.get('/products/photo/sm/:productId/', photoSM);

router.post('/product/review/:productId/:userId', requireSignin, isAuth, isAlreadyBuyyed, addReview);
router.post('/product/addVarient/:productId/:userId', requireSignin, isAuth, isAdmin, addVarient);
router.post('/product/addvarient0/:productId/:userId', requireSignin, isAuth, isAdmin, addVarient);
router.delete('/product/deleteVarient/:productId/:userId', requireSignin, isAuth, isAdmin, removeVarient);
router.get('/product/varient/:productId/', listVarients);
router.get('/product/varient/:productId/', listVarients);
router.get('/product/review/:productId', listReview);


router.param("userId", userById);
router.param("productId", productById);



module.exports = router;