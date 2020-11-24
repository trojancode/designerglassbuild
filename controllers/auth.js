const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { generateOTP, verifyOTP } = require('../helpers/otpHelper')
const {Order} = require('../models/order')

const jwt = require('jsonwebtoken');//for generating signed token
const expressJwt = require('express-jwt');//for authentication check

exports.signup = (req, res) => {
    //console.log(req.body);

    const user = new User(req.body);
    // user.phone=parseInt('91'+user.phone)
    User.findOne({phone:user.email},(err,userexist)=>{
        if(userexist){
            return res.status(400).json({
                error: "User Already Exist With Email",
            })
        }else{
            user.save((err, usr) => {
                if (err) {
                    return res.status(400).json({
                        error: "User Already Exist",
                    })
                }
                usr.salt = undefined
                usr.hashed_password = undefined;
        
                res.json(usr)
            })
        }
    })
};

exports.signin = (req,res) =>{
    //find user based on email
    const {email , password} = req.body
    User.findOne({email},(err,user)=>{
        if(err || !user){
            return res.status(400).json({
                err:"USer with email not found"
            })
        } 
        //if user is found make sure the email and pass match
        //create authenticate method in user model
        if(!user.authenticate(password)){
            return res.status(401).json({
                error:"EMail and password dont match"
            });
        }
        // generate a signed token with user id and secret

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)
        //persist the token as t in cookie with expiry date

        res.cookie('t',token,{expire:new Date()+9999})
        const { _id, name, email,phone,veryfied_phone,pincode,address, role } = user
        return res.json({ token, user: { _id, email, name,phone,veryfied_phone,pincode,address, role } });

    })
};
exports.signout = (req, res) => {
    res.clearCookie('t')
    res.json({ message: "Signout Success" })
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
});



exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if (!user) {
        return res.status(403).json({
            error: "Access denied"
        })
    }

    next()
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Admin resource! access denied"
        })
    } else if (req.profile.role === 1) {
        next();
    }

}


exports.isDBoy = (req, res, next) => {
    if (req.profile.role === 2) {
        next();
        return true;
    } else {
        return res.status(403).json({
            error: "Delivery Boy resource! access denied"
        })
    }

}



exports.isUserVerified = (req, res, next) => {
    User.findById({ _id: req.profile._id }, (err, usr) => {
        if (err) {
            return res.json(err)
        }
        if (usr.veryfied_phone != null) {
            if (usr.veryfied_phone) {
                next();
            }
            return res.json(usr.veryfied_phone)
        } else {
            return res.json({ error: "Error occured" })
        }
    })
}

exports.sentVerifyAccOTP = (req, res) => {
    let r = generateOTP(req.profile._id);

    if(r){
        return res.json({'msg':'otp sent successfully'});
    }else{
        return res.json({'error':'Otp send failed'})
    }
    
}



exports.verifyUserAcc = (req, res) => {

    User.findOneAndUpdate({ $and: [{ _id: req.profile._id }, { otp: req.body.otp },{phone:req.body.phone}] },{$set:{veryfied_phone:true}})
        .then((usr) => {
            if (usr != '' && usr != null) {
                return res.json({ msg: "User Verified", done: true });
            } else {
                return res.json({ msg: "User not verified", done: false,error:"Incorrect OTP" });
            }
        })

}


exports.verifyDeliveryOtp = (req, res) => {
    User.findOne({ $and: [{ _id: req.body.userId }, { otp: req.body.otp }] })
        .then((usr) => {
            if ( usr == null) {
                return res.status(400).json({error: "OTP confirmation failed user not found",body:req.body,user:usr})
            } else {
                Order.findOneAndUpdate({ $and: [{ _id: req.order._id }, { user: usr._id }] },{$set :{status:"Delivered"}}).then(order=>{
                    if(order=='' || order==null){
                        return res.status(400).json({error: "OTP confirmation failed <br/>",body:req.body,user:usr})
                    }else{
                        return res.json({msg:"Otp confirmed and order cupdated to delivered"})
                    }
                })
            }
        })

}
