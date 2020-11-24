const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { Order, CartItem } = require('../models/order')
var mongoose = require('mongoose');

exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "user not found"
            })
        }

        req.profile = user;
        next();
    });
};

exports.dBoyById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "user not found"
            })
        }
        req.dboy = user;
        next();
    });
};

exports.read = (req, res) => {
    req.profile.hashed_password = undefined
    req.profile.salt = undefined

    return res.json(req.profile);
}

exports.update = (req, res) => {
    User.findByIdAndUpdate({ _id: req.profile._id }, { $set: { name: req.body.name } }, { new: true }, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: "You are not authorized for this profile"
            })
        }

        user.hashed_password = undefined
        user.salt = undefined
        res.json(user)
    })
}


exports.updatePassword = (req, res) => {
    let pass = {password:req.body.password};
    let curpass = req.body.currentpassword;
    u = new User(pass)
    User.findById({ _id: req.profile._id }, (err, user) => {
        if (!user.authenticate(curpass)) {
            return res.status(401).json({
                error: "Current password is incorrect",
            });
        }else{
            User.findByIdAndUpdate({_id:req.profile._id},{$set: {salt:u.salt,hashed_password:u.hashed_password}},(er,usr)=>{
                if(er){
                    return res.status(401).json({
                        error: "Password Not Changed",
                    });
                }else{
                    return res.json({msg:"password changed"})
                }
            })
        }
    })
}

exports.updateUserAddress = (req, res, next) => {
    User.findByIdAndUpdate({ _id: req.profile._id }, {
        $set: {
            "address.city": req.body.order.address.city,
            "address.district": req.body.order.address.district,
            "address.address": req.body.order.address.address,
            "address.land_marks": req.body.order.address.land_marks,
            "address.state": req.body.order.address.state,
        }
    }, { new: true }, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: err,
                user: user,
                data: req.body
            })
        } else {
            next()
        }
    })
}

exports.addOrderToUserHistory = (req, res, next) => {
    let history = []

    req.body.order.products.forEach((item) => {
        history.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
        })
    })

    User.findOneAndUpdate(
        { _id: req.profile._id },
        { $push: { history: history } },
        { new: true },
        (err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Could not update user purchase history'
                })
            }
            next()
        })

}

exports.purchasehistory = (req, res) => {
    const res_orders = []
    Order.find({ $and: [{ user: req.profile._id },{ status: { $nin: ["Delivered", "Cancelled"] } },{isPaid:true}] })
        .populate('user', '_id name')
        .sort({'createdAt':'descending'})
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            res.json(orders)
        })
}

exports.purchasehistorydelcan = (req, res) => {
    const res_orders = []
    Order.find({ $and: [{ user: req.profile._id }, { payment_method: { $ne: "Notdefined" } }, { status: { $in: ["Delivered", "Cancelled"] } }] })
        .populate('user', '_id name')
        .populate('dboy', 'name phone email')
        .sort({'createdAt':'descending'})
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            orders.map((o, i) => {
                if (orders[i].payment_method == "Online Payment" && orders[i].isPaid != true) {
                    delete orders[i]
                } else {
                    res_orders.push(orders[i])
                }
            })
            res.json(res_orders)
        })
}

exports.dboyOrders = (req, res) => {
    Order.find({ $and: [{ dboy: req.profile._id }, { status: { $nin: ["Delivered", "Cancelled"] } }] })
        .populate('user', '_id products address amount status ')
        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(orders)
        })
}

exports.updatePincode = (req, res) => {
    User.findByIdAndUpdate({ _id: req.profile._id }, { $set: { pincode: req.body.pincode } }, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: "You are not authorized for this profile",
                err: err
            })
        }

        user.hashed_password = undefined
        user.salt = undefined
        res.json(user)
    })
}


exports.getgetDboyDetails = (req, res) => {
    User.find({ _id: req.dboy._id }, { name: 1, phone: 1, email: 1 }, (err, orders) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(orders)
    })
}


exports.listDboy = (req, res) => {
    User.find({ role: 2 }, (err, orders) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(orders)
    })
}


exports.makeDboy = (req, res) => {
    User.findOneAndUpdate({ email: req.body.email }, { $set: { role: 2 } }, (err, user) => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }
        if (user === null) {
            return res.json({ error: "User not found" })
        }
        res.json(user)
    })
}


exports.fireDboy = (req, res) => {
    User.findOneAndUpdate({ email: req.body.email }, { $set: { role: 0 } }, (err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        if (user === null) {
            return res.json({ error: "User not found" })
        }
        res.json(user)
    })
}


exports.getDboyCurrentOrder = (req, res) => {
    User.findById({ _id: req.profile._id }, { duty_orders: 1 }, (err, user) => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        } else {
            if (user.duty_orders.length > 0) {
                Order.findById({ _id: user.duty_orders[0]._id })
                    .populate('user', '_id name address email phone pincode')
                    .exec(
                        (er, order) => {
                            if (er) {
                                return res.status(400).json({
                                    error: er
                                })
                            }
                            res.json({ order })
                        })
            } else {
                res.json({ err: "No Order assigned to you" })
            }

        }
    })
}



exports.nextCurrentOrder = (req, res) => {

    Order.findOne({ $and: [{ _id: req.body.orderid }, { dboy: req.profile._id }] })
        .populate('dboy', '_id name')
        .exec((er, order) => {
            if (er) {
                return res.status(400).json({
                    error: er
                })
            } else {
                User.findOneAndUpdate({ _id: order.dboy._id }, { $pull: { duty_orders: { _id: order._id } } }, { projection: { _id: 1, duty_orders: 1 } }, (err, user) => {
                    if (err) {
                        return res.status(400).json({
                            error: err
                        })
                    } else {
                        return res.json({ user })
                    }
                })
            }
        })

}


exports.dboyOrdersDeliveredorCancelled = (req, res) => {
    Order.find({ $and: [{ dboy: req.profile._id }, { status: { $in: ["Delivered", "Cancelled"] } }] })
        .populate('user', '_id products address amount status ')
        .sort('-created')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            res.json(orders)
        })
}


