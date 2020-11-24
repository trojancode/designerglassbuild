const express = require('express');
const router = express.Router();


const { requireSignin, isAuth, isAdmin, } = require('../controllers/auth');
const { userById, } = require('../controllers/user');
const { listBanner, bannerPhoto, createBanner, deleteBanner,bannerById } = require('../controllers/banner');


router.get('/banner/list/', listBanner);
router.get('/banner/photo/:bannerId/', bannerPhoto);
router.post('/banner/create/:userId/', requireSignin, isAuth, isAdmin, createBanner);
router.delete('/banner/delete/:userId/:bannerId', requireSignin, isAuth, isAdmin, deleteBanner);


router.param("userId", userById);
router.param("bannerId", bannerById);


module.exports = router;