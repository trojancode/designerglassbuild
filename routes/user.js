const express = require('express');
const router = express.Router();


const { requireSignin, isAuth, isAdmin, isUserVerified, verifyUserAcc, sentVerifyAccOTP } = require('../controllers/auth');
const { userById, read, update, purchasehistory, updatePincode, purchasehistorydelcan, updatePassword } = require('../controllers/user');
const { userPasswordChangeValidator } = require('../validator/index')

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
    res.json({
        user: req.profile
    })
});

router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);

router.put('/user/password/:userId', requireSignin, isAuth, userPasswordChangeValidator, updatePassword);

router.get('/orders/by/user/:userId', requireSignin, isAuth, purchasehistory);
router.get('/orders/by/user/delcan/:userId', requireSignin, isAuth, purchasehistorydelcan);
router.put('/user/pincode/:userId', requireSignin, isAuth, updatePincode);

router.post('/user/:userId/isVerified/', isUserVerified);
router.post('/user/:userId/getOtpVerifyAcc/', requireSignin, isAuth ,sentVerifyAccOTP);
router.post('/user/:userId/verifyUser/', requireSignin, isAuth, verifyUserAcc);

router.get('/about',(req,res)=>{
    return res.json({
        ig:"pecoad",
        web:"www.pecoad.com"
    })
})


router.param("userId", userById);


module.exports = router;