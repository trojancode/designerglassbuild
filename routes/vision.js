const express = require('express');
const router = express.Router();


const { productById,} = require('../controllers/product');
const { visionById,read,create,remove,update,photo,list} = require('../controllers/vision');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');


router.get('/vision/:visionId/', read);
router.get('/visions/list/', list);
router.get('/vision/photo/:visionId/', photo);
router.post('/vision/:userId/',requireSignin, isAuth,isAdmin, create);
router.delete('/vision/:visionId/:userId/',requireSignin, isAuth,isAdmin, remove);
router.put('/vision/:visionId/:userId/',requireSignin, isAuth,isAdmin, update);


router.param("userId", userById);
router.param("productId", productById);
router.param("visionId", visionById);



module.exports = router;