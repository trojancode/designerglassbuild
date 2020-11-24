const { Order, CartItem } = require('../models/order')
const Vision = require('../models/vision');
const User = require('../models/user')
const Product = require('../models/product')
const { errorHandler } = require('../helpers/dbErrorHandler');
var mongoose = require('mongoose');
var checksum = require('../models/checksum');
var config = require('../config/config');
const Razorpay = require('razorpay');
let rzp = new Razorpay({
    key_id: 'rzp_test_NNhJVdaVwDdCox', // your `KEY_ID`
    key_secret: 'IgjPkd9hpI4jEXrmpRDKcp25' // your `KEY_SECRET`
});


const request = require('request-promise');

exports.orderById = (req, res, next, id) => {
    Order.findById(id)
        .populate('products.product', 'name price')
        .exec((err, order) => {
            if (err || !order) {
                return res.status(400).json({
                    error: "order not found"
                })
            }
            req.order = order
            next();
        })
}


exports.listOrders = (req, res) => {

    Order.find()
        .populate('user', "_id name address")
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

exports.getStatusValues = (req, res) => {
    res.json(Order.schema.path('status').enumValues);
}


exports.updateorderStatus = (req, res) => {
    // if (req.body.status == "Delivered") {
    //     return res.json({ msg: "Denied" })
    // } else {
    Order.update({ _id: req.body.orderId }, { $set: { status: req.body.status } }, (err, order) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(order);
    })
    // }
}



exports.isDBoySame = (req, res, next) => {
    if (req.profile._id.equals(req.order.dboy._id)) {
        next();
        //return res.json({msg: "next"})
    } else {

        return res.json({ msg: "failed to access the data", usr: req.profile._id, orderusr: req.order.dboy._id })
    }
}

exports.assignOrderDboy = (req, res) => {

    Order.update({ _id: req.order.id }, { $set: { dboy: req.body.dboy } }, (err, order) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        } else {

            User.updateMany({}, { $pull: { duty_orders: { _id: new mongoose.Types.ObjectId(req.order.id) } } }, (e, ur) => {
                if (e) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    })
                }

                User.updateOne({ _id: req.body.dboy }, { $push: { duty_orders: { _id: new mongoose.Types.ObjectId(req.order.id) } } }, (er, usr) => {
                    if (er) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        })
                    }
                    res.json({ orderId: req.order.id, message: "Delivery Boy Assigned Successfully" });
                })
            })
        }
    })
}


exports.listOrdersNotDelivered = (req, res) => {
    Order.find({ $and: [{ status: { $nin: ['Delivered', 'Cancelled', 'Processing', 'Shipped'] } }, { payment_method: { $ne: 'Notdefined' } }] })
        .populate('user', "_id name address")
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

exports.listOrdersDeliveredCancelled = (req, res) => {
    Order.find({ $and: [{ status: { $in: ['Delivered', 'Cancelled'] } }, { payment_method: { $ne: 'Notdefined' } }] })
        .populate('user', "_id name address")
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


exports.listOrdersProcessing = (req, res) => {
    Order.find({ $and: [{ status: { $nin: ['Delivered', 'Cancelled', 'Not processed'] } }, { payment_method: { $ne: 'Notdefined' } }] })
        .populate('user', "_id name address")
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


exports.createCOD = (req, res) => {
    req.body.order.user = req.profile
    req.body.order.amount = 0


    Product.find({ _id: { $in: req.body.order.products } }, { photo: 0 }, { useFindAndModify: false }, (err, products) => {
        products.map((pr, iN) => {
            req.body.order.products.map((p, i) => {
                if (pr._id == p._id) {
                    req.body.order.products[i].name = pr.name;
                    req.body.order.products[i].price = pr.price;
                    req.body.order.products[i].offer = pr.offer;
                    req.body.order.products[i].qty_type = pr.qty_type;
                    req.body.order.amount += (pr.price - pr.offer) * req.body.order.products[i].count;

                }
                if (p.lense.lens_option_selected != null) {
                    console.log("lense option selected");
                    req.body.order.amount += p.lense.lens_option_selected.price
                } else {
                    console.log("lense option");
                    req.body.order.amount += p.lense.lens_option.price
                }
                if (p.lense.vision_selected != null) {
                    console.log("vision selected");
                    req.body.order.amount += p.lense.vision_selected.price
                } else {
                    console.log("vision");
                    req.body.order.amount += p.lense.vision.price

                }
            })

        })

        req.body.order.payment_method = "Cash On Delivery";
        req.body.order.isPaid = false
        req.body.order.paid = 0

        const order = new Order(req.body.order)

        order.save((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            } else {
                res.json(data)
            }
        });
    })
};




exports.create = (req, res) => {
    req.body.order.user = req.profile
    req.body.order.amount = 0


    Product.find({ _id: { $in: req.body.order.products } }, { photo: 0 }, { useFindAndModify: false }, (err, products) => {
        products.map((pr, iN) => {
            req.body.order.products.map((p, i) => {
                if (pr._id == p._id) {
                    req.body.order.products[i].name = pr.name;
                    req.body.order.products[i].price = pr.price;
                    req.body.order.products[i].offer = pr.offer;
                    req.body.order.products[i].qty_type = pr.qty_type;
                    req.body.order.amount += (pr.price - pr.offer) * req.body.order.products[i].count;

                }
                if (p.lense.lens_option_selected != null) {
                    console.log("lense option selected");
                    req.body.order.amount += p.lense.lens_option_selected.price
                } else {
                    console.log("lense option");
                    req.body.order.amount += p.lense.lens_option.price
                }
                if (p.lense.vision_selected != null) {
                    console.log("vision selected");
                    req.body.order.amount += p.lense.vision_selected.price
                } else {
                    console.log("vision");
                    req.body.order.amount += p.lense.vision.price

                }
            })

        })

        req.body.order.payment_method = "Online Payment";
        req.body.order.isPaid = false
        req.body.order.paid = 0

        var options = {
            amount: req.body.order.amount * 100,
            currency: "INR",
        };
        rzp.orders.create(options, (err, ord) => {
            req.body.order.order_id = ord.id;
            const order = new Order(req.body.order)

            order.save((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    })
                } else {
                    res.json(data)
                }
            })
        });
    })

};


exports.ProcessPayment = (req, res) => {
}


exports.executePayment = (req, res) => {
}

exports.verifyPayment = (req, res) => {
    rzp.payments.capture(req.body.paymentData.razorpay_payment_id, req.body.paymentData.amount, "INR").then((data) => {
        Order.findByIdAndUpdate({ _id: req.body.paymentData.order_id }, { $set: { isPaid: true, paid: (req.body.paymentData.amount / 100), payment_method: "Online Payment" } }, (err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Order Failed due to payment error 2"
                });
            } else {


                // request(options)
                //     .then(function (response) {
                //         // Handle the response
                //         return true;
                //     })
                //     .catch(function (err) {
                //         return false;
                //         // Deal with the error
                //     })

                return res.json({ "success": "order Placed Successfully", data })

            }
        })
    }).catch((error) => {
        return res.json({ error, body: req.body });
    })



    // request({
    //     method: 'POST',
    //     url: `https://rzp_test_RA855mK8Oynb35:PfxIv3zNZrtHv5b3uDqEiLZH@api.razorpay.com/v1/payments/${req.body.order._id}/capture`,
    //     form: {
    //       amount: parseInt(20),
    //       currency: "INR"
    //     }
    //   }, function (error, response, body) {
    //     return res.json(body);
    //   });

}

function sendsms() {
    const options = {
        method: 'POST',
        uri: 'https://api.msg91.com/api/v2/sendsms',
        body: {
            "sender": "SVNMRT",
            "route": "4",
            "country": "91",
            "sms": [
                {
                    "message": `Your Order at 7-MART Grocery App is Placed Successfully`,
                    "to": [`${req.profile.phone.substring(2)}`]
                }
            ]
        },
        headers: {
            'authkey': '274503A0h65WGyk775ee11586P1',
            'Content-Type': 'application/json'
        },
        json: true
    }
}


exports.isAlreadyBuyyed = (req, res, next) => {
    Order.findOne({ $and: [{ user: req.profile }, { products: { $elemMatch: { _id: req.product._id } } }] }, (err, succ) => {
        if (err || succ == null) {
            return res.json({
                error: "Product not buyyed"
            })
        }
        next();
        // return res.json({succ})
    })
}