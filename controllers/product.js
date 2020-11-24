const Product = require('../models/product');
const ImageM = require('../models/image');
const Review = require('../models/review');
const fromidable = require('formidable');
const {
    errorHandler
} = require('../helpers/dbErrorHandler');
const fs = require('fs');
const _ = require('lodash');
const sharp = require('sharp');
const multer = require("multer");
var path = require('path');
const upload = multer({
    dest: "../image"
});
ObjectId = require('mongodb').ObjectID;


const qty_enum = {
    kg: 0.25,
    gm: 0.05,
    Piece: 1,
    Packet: 1,
    Bottle: 1,
    Box: 1,
}

exports.productById = (req, res, next, id) => {
    Product.findById(id)
        .populate({
            path: 'category',
            select: '-photo',
        }).populate({
            path: 'brand',
            select: '-photo',
        }).exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: "Product not found"
                })
            }
            req.product = product
            next();
        });
};


exports.read = (req, res) => {
    Review.find({ product: req.product._id }, (err, succ) => {
        if (err) {
            return res.status(400).json({
                error: "Something happened"
            })
        }
        req.product.review = succ
        return res.json(req.product)
    })
};



exports.create = (req, res) => {
    let form = new fromidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }

        //check for all fields
        const {
            name,
            brand,
            description,
            price,
            category,
            quantity,
            group,
            gender,
            shape,
            material,
            frame_type,
            hing,
            color,
            width,
            temple,
            featured,
            lens_height,
            lens_width,
            bridge,
        } = fields

        if (!bridge || !lens_width || !lens_height || !featured || !temple || !width || !name || !brand || !description || !price || !category || !quantity || !group || !gender || !shape || !material || !frame_type || !hing || !color) {
            return res.status(400).json({
                error: "All fields are required"
            })
        }

        // fields.pincode = fields.pincode.split(" ")

        fields.diemension = {
            width: width,
            temple: temple,
            lens_height: lens_height,
            lens_width: lens_width,
            bridge: bridge,

        }

        let product = new Product(fields);


        //photo is a name from client side.

        // console.log(files);

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }

            product.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err,
                        pincode: pincode
                    })
                } else {
                    const Image = new ImageM({
                        product: result.id
                    });
                    Image.save((error, suc) => {
                        if (error) {
                            return res.status(400).json({
                                error: error,
                            });
                        } else {
                            const tempPath = files.photo.path;
                            const targetPath = __dirname + "/image/" + suc.id + path.extname(files.photo.name);
                            fs.rename(tempPath, targetPath, function (err) {
                                if (err) {
                                    return res.status(400).json({
                                        error: err,
                                    });
                                }
                                console.log("print update start ");

                                Product.findByIdAndUpdate({
                                    _id: result.id
                                }, {
                                    $push: {
                                        photo: [suc.id]
                                    }
                                }, (err, prod) => {
                                    if (err) {

                                        return res.status(400).json({
                                            error: err,
                                        });
                                    }
                                })
                                res.end();
                            });
                        }
                    });
                }
                res.json(result)
            })
        }

    })
};



exports.remove = (req, res) => {
    let product = req.product
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({
            "message": 'product deleted successfully'
        })
    })
};

exports.update = (req, res) => {
    let form = new fromidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }

        //check for all fields
        // const {
        //     name,
        //     description,
        //     price,
        //     category,
        //     quantity,
        //     shipping
        // } = fields

        // if (!name || !description || !price || !category || !quantity || !shipping) {
        //     return res.status(400).json({
        //         error: "all fields are required"
        //     })
        // }
        let product = req.product
        product = _.extend(product, fields)


        //photo is a name from client side.

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }

            res.json(result)
        })
    })
};


//   /products?sortBy=sold&order=desc&limit=4
//   /products?sortBy=sold&order=desc&limit=4


exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find({})
        .populate('category', "-photo ")
        .sort([
            [sortBy, order]
        ])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: `Product not found`
                })
            }
            res.json(products)
        })
}

exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;
    Product.find({
        _id: {
            $ne: req.product
        },
        category: req.product.category
    })
        .limit(limit)
        .populate('category', '_id name')
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: `Empty `
                })
            }

            res.json(products)
        })
};


exports.listByCategory = (req, res) => {
    Product.find({
        category: req.body.category
    }, {
        photo: 0
    }, (err, products) => {
        return res.json(products)
    })

};

exports.listCategories = (req, res) => {
    Product.distinct("category", {}, (err, categories) => {
        if (err) {
            return res.status(400).json({
                error: `categories not fount `
            })
        }
        res.json(categories)
    })
}


exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
    console.log(order, sortBy, limit, skip, req.body.filters);

    Product.find(findArgs)
        .populate('category')
        .sort([
            [sortBy, order]
        ])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found'
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req, res,) => {
    if (req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType)

        return res.send(req.product.photo.data)

    }

}


exports.photoSM = (req, res) => {
    if (req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType)

        var base64img = req.product.photo.data;

        // let parts = base64img.toString().split(';');
        // let mimType = parts[0].split(':')[1];
        // let imageData = parts[1].split(',')[1];
        // var img = new Buffer(imageData, 'base64');
        // return res.send(parts)

        sharp(base64img)
            .resize(250, 250)
            .toBuffer()
            .then(resizedImageBuffer => {
                let resizedImageData = resizedImageBuffer.toString('base64');
                // let resizedBase64 = `data:${req.product.photo.contentType};base64,${resizedImageData}`;
                var img = Buffer.from(resizedImageData, 'base64');
                // res.set('Content-Length', img.length)
                res.send(img);
            })
            .catch(error => {
                // error handeling
                res.send(error)
            })

    }

    // next();
}

exports.listSearch = (req, res) => {
    //create query object to hold search value and category value

    const query = {}
    //assign search value to query.name
    if (req.query.search) {
        query.name = {
            $regex: req.query.search,
            $options: 'i'
        }
        //assign category to query.category

        if (req.query.category && req.query.category != 'All') {
            query.category = req.query.category
        }

        //find the product based on query with 2 properties
        //search and category

        Product.find(query, (err, products) => {

            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(products)
        }).select("-photo")

    }
}



exports.decreaseQuantity = (req, res, next) => {
    let bulKOps = req.body.order.products.map((item) => {
        return {
            updateOne: {
                filter: {
                    _id: item._id
                },
                update: {
                    $inc: {
                        quantity: -item.count,
                        sold: +item.count
                    }
                }
            }
        }
    });

    Product.bulkWrite(bulKOps, {}, (err, products) => {
        if (err) {
            return res.status(400).json({
                error: err.message
            })
        }
        next();
    })
}


exports.isPincodeAvail = (req, res, next) => {
    next()

}


exports.isStockAvail = (req, res, next, needresponse = false) => {

    let avail = true;

    let count = JSON.parse(JSON.stringify(req.body.order.products)); //user products

    let products = JSON.parse(JSON.stringify(req.body.order.products))
    //return res.json(products)
    products.map((p, i) => {
        products[i] = products[i]._id
    })

    Product.find({
        $and: [{
            _id: {
                $in: products
            }
        }]
    }, {
        quantity: 1,
        _id: 1
    }).then((product) => { //product - server product


        async function checkqty() {
            await count.map((p, i) => {

                var checkQty = product.find((e) => { //quantity from server
                    if (e._id == p._id) {
                        // console.log(e._id,p._id);

                        return e.quantity;
                    }
                })

                if (checkQty.quantity < p.count || checkQty < 0 || p.count < 0) {
                    avail = false;
                }

            })
        }
        checkqty();
        if (needresponse) {
            return res.json({
                msg: "Enough Stock",
                count,
                product
            })
        }
        if (avail == false) {
            return res.status(400).json({
                error: "Not Enough Stock",
            })
        } else {
            next();
        }

    })

}

exports.addReview = (req, res,) => {

    Review.findOneAndUpdate({
        user: req.profile
    }, {
        $set: {
            user: req.profile,
            content: req.body.content,
            rating: req.body.rating,
            product: req.product._id,
            user_name: req.profile.name
        }
    }, {
        useFindAndModify: false
    }, (err, succ) => {
        if (err) {
            return res.status(400).json({
                error: err,
            })
        }
        if (succ == null) {
            const review = new Review({
                user: req.profile,
                content: req.body.content,
                rating: req.body.rating,
                product: req.product._id,
                user_name: req.profile.name
            })
            review.save((err, succ) => {
                if (err) {
                    return res.status(400).json({
                        error: err,
                    })
                }
                return res.json({
                    succ: "Success"
                })
            })
        } else {

            return res.json({
                succ: "Success"
            })
        }
    })
}

exports.listReview = (req, res,) => {

    Review.find({
        product: req.product._id
    }, (err, succ) => {
        if (err) {
            return res.status(400).json({
                error: err,
            })
        }
        return res.json(succ)
    })
}



exports.addVarient = (req, res) => {
    console.log(req);
    Product.findByIdAndUpdate({ _id: req.product.id }, {
        $push: {
            variants: [{
                _id: req.body.id,
                color: req.body.color,
            }]
        }
    },
        { multi: true }, (err, prod) => {
            if (err) {

                return res.status(400).json({
                    error: err,
                });
            }


            Product.findByIdAndUpdate({ _id: req.body.id }, {
                $push: {
                    variants: [{
                        _id: req.product.id,
                        color: req.product.color,
                    }]
                }
            },
                { multi: true }, (err, prod) => {
                    if (err) {

                        return res.status(400).json({
                            error: err,
                        });
                    }




                    res.json({
                        "message": 'Varient Added successfully'
                    })
                })
        })
};


exports.removeVarient = (req, res) => {
    Product.findByIdAndUpdate({ _id:req.product._id }, {
        $pull: {
            variants: {
                $in: [{
                    _id: req.body.id,
                    color: req.body.color,
                }]}
        }
    },
        { multi: true }, (err, prod) => {
            if (err) {

                return res.status(400).json({
                    error: err,
                });
            }

            Product.findByIdAndUpdate({ _id: req.body.id }, {
                $pull: {
                    variants: {
                        $in: [{
                            _id: req.product.id,
                            color: req.product.color,
                        }]
                    }
                }
            },
                { multi: true }, (err, prod) => {
                    if (err) {

                        return res.status(400).json({
                            error: err,
                        });
                    }




                    res.json({
                        "message": "Varient deleted"
                    })
                })


        })
};


exports.listVarients = (req, res,) => {

    let vid = [];

        req.product.variants.map((item)=>{
            vid.push(item._id);
        })

    Product.find({
        _id: {
            $in: vid
        }
    }, (err, succ) => {
        if (err) {
            return res.status(400).json({
                error: err,
            })
        }
        return res.json(succ)
    })
}
