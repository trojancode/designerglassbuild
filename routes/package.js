const express = require('express');
const router = express.Router();


const { requireSignin, isAuth, isAdmin, } = require('../controllers/auth');
const { userById, } = require('../controllers/user');
const { list, create, remove,packageById,read,update } = require('../controllers/package');

router.get('/package/list/', list);
router.get('/package/:packageId/', read);
router.post('/package/create/:userId/', requireSignin, isAuth, isAdmin, create);
router.put('/package/update/:userId/:packageId', requireSignin, isAuth, isAdmin, update);
router.delete('/package/delete/:userId/:packageId', requireSignin, isAuth, isAdmin, remove);

router.param("userId", userById);
router.param("packageId", packageById);


module.exports = router;