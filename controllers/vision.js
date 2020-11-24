
const Vision = require('../models/vision');
const fromidable = require('formidable');
const {
    errorHandler
} = require('../helpers/dbErrorHandler');
const fs = require('fs');
const _ = require('lodash');
var path = require('path');
var async = require("async");

exports.visionById = (req, res, next, id) => {
    Vision.findById(id)
        .exec((err, vision) => {
            if (err || !vision) {
                return res.status(400).json({
                    error: "Vision not found@"
                })
            }
            req.vision = vision
            next();
        });
};




exports.read = (req, res) => {
    return res.json(req.vision);
};

exports.list = (req, res) => {
    Vision.find({})
        .exec((err, vision) => {
            if (err || !vision) {
                return res.status(400).json({
                    error: "Nos visons"
                })
            }
            return res.json(vision)
        });
};




exports.photo = (req, res) => {
    return res.sendFile(__dirname + "/vision/" + req.vision._id + ".svg");
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
            description,
        } = fields

        if (!name || !description) {
            return res.status(400).json({
                error: "All fields are required"
            })
        }
        fields.subtype = JSON.parse(fields.subtype)

        let max_price = 0;
        for (let i = 0; i < fields.subtype.length; i++) {
            if (max_price < fields.subtype[i].price) {
                max_price = fields.subtype[i].price;
            }
        }
        fields.price = max_price;

        let vision = new Vision(fields);


        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1 mb"
                })
            }
            if (path.extname(files.photo.name) != '.svg') {
                return res.status(400).json({
                    error: "Image should be svg form"
                })
            }

            vision.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err,
                        pincode: pincode
                    })
                } else {
                    const tempPath = files.photo.path;
                    const targetPath = __dirname + "/vision/" + result.id + path.extname(files.photo.name);
                    fs.rename(tempPath, targetPath, function (err) {
                        if (err) {
                            return res.status(400).json({
                                error: err,
                            });
                        }
                    });
                }
                return res.json(result)
            })
        }

    })
};



exports.remove = (req, res) => {
    let vision = req.vision
    vision.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({
            "message": 'vision deleted successfully'
        })
    })
};

exports.update = (req, res) => {

    let vision = req.vision
    vision = _.extend(vision, req.body)


    let max_price = 0;
    for (let i = 0; i < vision.subtype.length; i++) {
        if (max_price < vision.subtype[i].price) {
            max_price = vision.subtype[i].price;
        }
    }
    vision.price = max_price;

    vision.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json(result)
    })
};

exports.calculate_vision_price = (req, res, next) => {
    req.body.order.amount = 0
    // async.waterfall([
    //     () => {
    //     },
    // ],(err,result)=>{
    //     console.log(err);
        
    // })
}

