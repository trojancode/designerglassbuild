const Category = require('../models/category');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fromidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const sharp = require('sharp');


exports.categoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
        if (err || !category) {
            return res.status(400).json({
                error: "Category is not Exist"
            })
        }
        req.category = category
        next();
    })
}

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

        let category = new Category(fields);


        //photo is a name from client side.

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }
            category.photo.data = fs.readFileSync(files.photo.path)
            category.photo.contentType = files.photo.type
        }

        category.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                })
            }

            res.json(result)
        })
    })



    // const category = new Category(req.body)

    // category.save((err,data)=>{
    //     if(err){
    //         return res.status(400).json({
    //             error: errorHandler(err)
    //         })
    //     }
    //     res.json({data});
    // })
};



exports.read = (req, res) => {
    req.category.photo = undefined
    return res.json(req.category);
}

exports.photo = (req, res) => {
    if (req.category.photo) {
        res.set('Content-Type', req.category.photo.contentType)


        var base64img = req.category.photo.data;


        sharp(base64img)
            .resize(120, 120)
            .toBuffer()
            .then(resizedImageBuffer => {
                let resizedImageData = resizedImageBuffer.toString('base64');

                var img = Buffer.from(resizedImageData, 'base64');

                res.send(img);
            })
            .catch(error => {
                res.send(error)
            })

    }
}

exports.update = (req, res) => {
    let form = new fromidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }

        let category = req.category
        category = _.extend(category, fields)


        //photo is a name from client side.

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }
            category.photo.data = fs.readFileSync(files.photo.path)
            category.photo.contentType = files.photo.type
        }

        category.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }

            res.json(result)
        })
    })

}

exports.remove = (req, res) => {
    const category = req.category
    category.remove((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({ message: "Category dleted" });
    })

}

exports.list = (req, res) => {

    Category.find({}, { photo: 0 }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        data.photo = undefined

        res.json(data);
    })

}