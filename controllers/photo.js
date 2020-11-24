
const ImageM = require('../models/image');
const fromidable = require('formidable');
const Product = require('../models/product');
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

exports.photoById = (req, res, next, id) => {
    ImageM.findById(id)
        .exec((err, Image) => {
            if (err || !Image) {
                return res.status(400).json({
                    error: "Photo not found"
                })
            }
            req.Image = Image
            next();
        });
};


exports.read = (req, res) => {

    if (fs.existsSync(__dirname + "/image/" + req.Image.id + ".png")) {
        return res.sendFile(__dirname + "/image/" + req.Image.id + ".png");
    } else if (fs.existsSync(__dirname + "/image/" + req.Image.id + ".jpg")) {
        return res.sendFile(__dirname + "/image/" + req.Image.id + ".jpg");

    } else if (fs.existsSync(__dirname + "/image/" + req.Image.id + ".jpeg")) {
        return res.sendFile(__dirname + "/image/" + req.Image.id + ".jpeg");

    }
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

        // //check for all fields
        // const {
        //     productid,
        // } = fields

        // if (!productid ) {
        //     return res.status(400).json({
        //         error: "All fields are required"
        //     })
        // }

        //photo is a name from client side.

        // console.log(files);

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }

            const Image = new ImageM({
                product: req.product.id
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
                            _id: req.product.id
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
                        res.json({ success: "Image added" });
                    });
                }
            });
        }

    })
};


exports.photobyProductid = (req, res) => {
    ImageM.find({ product: req.product._id })
        .exec((err, Image) => {
            if (err || !Image) {
                return res.status(400).json({
                    error: "Photo not found"
                })
            }
            return res.sendFile(__dirname + "/image/" + Image[0]._id + ".png");
            return res.json(Image)

        });
};




exports.remove = (req, res) => {
    let image = req.Image
    let product = req.product
    image.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }


        if (fs.existsSync(__dirname + "/image/" + req.Image.id + ".png")) {
            fs.unlinkSync(__dirname + "/image/" + req.Image.id + ".png");
        } else if (fs.existsSync(__dirname + "/image/" + req.Image.id + ".jpg")) {
            fs.unlinkSync(__dirname + "/image/" + req.Image.id + ".jpg");
        } else if (fs.existsSync(__dirname + "/image/" + req.Image.id + ".jpeg")) {
            fs.unlinkSync(__dirname + "/image/" + req.Image.id + ".jpeg");
        }

        Product.findByIdAndUpdate({ _id: product.id }, { $pull: { photo: { $in: [req.Image.id] } } },
            { multi: true }, (err, prod) => {
                if (err) {

                    return res.status(400).json({
                        error: err,
                    });
                }

                console.log(req.Image.id);



                res.json({
                    "message": 'Image deleted successfully'
                })
            })
    })
};



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
