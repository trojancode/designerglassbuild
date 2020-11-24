const express = require('express');
const router = express.Router();


const { requireSignin, isAuth, isAdmin, } = require('../controllers/auth');
const { userById, } = require('../controllers/user');
const { brandById,photo,list ,remove,create} = require('../controllers/brand');


router.get('/brand/list/',list);
router.get('/brand/photo/:brandId/', photo);
router.post('/brand/create/:userId/', requireSignin, isAuth, isAdmin, create);
router.delete('/brand/delete/:userId/:brandId', requireSignin, isAuth, isAdmin, remove);


router.param("userId", userById);
router.param("brandId", brandById);


module.exports = router;