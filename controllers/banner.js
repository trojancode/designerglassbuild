// const User = require('../models/user');
const { errorHandler } = require('../helpers/dbErrorHandler');
const Banner = require('../models/banner');
var mongoose = require('mongoose');
const fromidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const sharp = require('sharp');

exports.bannerById = (req, res, next, id) => {
    Banner.findById(id).exec((err, banner) => {
        if (err || !banner) {
            return res.status(400).json({
                error: "Banner not found"
            })
        }

        req.banner = banner;
        next();
    });
};

exports.listBanner = (req, res) => {
    Banner.find({}, { photo: 0 }).exec((err, banner) => {
        if (err || !banner) {
            return res.status(400).json({
                error: "banner not found"
            })
        } else {
            return res.json(banner)
        }

    });
};


exports.bannerPhoto = (req, res) => {
    if (req.banner.photo.data) {
        res.set('Content-Type', req.banner.photo.contentType)

        var base64img = req.banner.photo.data;

        // let parts = base64img.toString().split(';');
        // let mimType = parts[0].split(':')[1];
        // let imageData = parts[1].split(',')[1];
        // var img = new Buffer(imageData, 'base64');
        // return res.send(parts)

        sharp(base64img)
            .resize(500, 250)
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

exports.createBanner = (req, res) => {
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
        } = fields

        if (!name ) {
            return res.status(400).json({
                error: "all fields are required"
            })
        }

        let banner = new Banner(fields);


        //photo is a name from client side.

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }
            banner.photo.data = fs.readFileSync(files.photo.path)
            banner.photo.contentType = files.photo.type
        }

        banner.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                    pincode: pincode
                })
            }

            res.json(result)
        })
    })
}

exports.deleteBanner = (req, res) => {
    
    let banner = req.banner
    banner.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({
            "message": 'Banner deleted successfully'
        })
    })
}

