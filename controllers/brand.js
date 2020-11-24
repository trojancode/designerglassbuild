const Brand = require('../models/brand');
const fromidable = require('formidable');
const {
    errorHandler
} = require('../helpers/dbErrorHandler');
const fs = require('fs');
const _ = require('lodash');
const sharp = require('sharp');

const qty_enum = {
    kg: 0.25,
    gm: 0.05,
    Piece: 1,
    Packet: 1,
    Bottle: 1,
    Box: 1,
}

exports.brandById = (req, res, next, id) => {
    Brand.findById(id)
        .populate('category')
        .exec((err, brand) => {
            if (err || !brand) {
                return res.status(400).json({
                    error: "Product not found"
                })
            }

            req.brand = brand
            next();
        });
};


exports.read = (req, res) => {
    req.brand.photo = undefined
    return res.json(req.brand)
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
            name
        } = fields

        if (!name) {
            return res.status(400).json({
                error: "all fields are required"
            })
        }

        let brand = new Brand(fields);


        //photo is a name from client side.

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }
            brand.photo.data = fs.readFileSync(files.photo.path)
            brand.photo.contentType = files.photo.type
        }

        brand.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                })
            }

            res.json(result)
        })
    })
};



exports.remove = (req, res) => {
    let brand = req.brand
    brand.remove((err, deletedbrand) => {
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
        let brand = req.brand
        brand = _.extend(brand, fields)


        //photo is a name from client side.

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }
            brand.photo.data = fs.readFileSync(files.photo.path)
            brand.photo.contentType = files.photo.type
        }

        brand.save((err, result) => {
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

    Brand.find({})
        .select("-photo")
        .populate('category', "-photo")
        .sort([
            [sortBy, order]
        ])
        .limit(limit)
        .exec((err, brands) => {
            if (err) {
                return res.status(400).json({
                    error: `Product not found`
                })
            }
            res.json(brands)
        })
}


exports.photo = (req, res, next) => {
    if (req.brand.photo.data) {
        res.set('Content-Type', req.brand.photo.contentType)

        return res.send(req.brand.photo.data)

    }

    next();
}


exports.photoSM = (req, res) => {
    if (req.brand.photo.data) {
        res.set('Content-Type', req.brand.photo.contentType)

        var base64img = req.brand.photo.data;

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
