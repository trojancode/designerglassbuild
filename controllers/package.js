const Package = require('../models/package');
const fromidable = require('formidable');
const {
    errorHandler
} = require('../helpers/dbErrorHandler');
const fs = require('fs');
const _ = require('lodash');
const sharp = require('sharp');


exports.packageById = (req, res, next, id) => {
    Package.findById(id)
        .populate('category')
        .exec((err, package) => {
            if (err || !package) {
                return res.status(400).json({
                    error: "Package not found"
                })
            }

            req.package = package
            next();
        });
};


exports.read = (req, res) => {
    return res.json(req.package)
};



exports.create = (req, res) => {
    const {
        name,
        price,
        properties,
        color
    } = req.body

    if (!name || !price || !color || !properties) {
        return res.status(400).json({
            error: "all fields are required"
        })
    }

    let package = new Package(req.body);


    //photo is a name from client side.

    package.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: err,
            })
        }

        res.json(result)
    })
};



exports.remove = (req, res) => {
    let package = req.package
    package.remove((err, deletedbrand) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({
            "message": 'Package deleted successfully'
        })
    })
};

exports.update = (req, res) => {
    
    let package = req.package
    package = _.extend(package, req.body)

    package.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json(result)
    })
};


//   /products?sortBy=sold&order=desc&limit=4
//   /products?sortBy=sold&order=desc&limit=4


exports.list = (req, res) => {

    Package.find({})
        .exec((err, package) => {
            if (err) {
                return res.status(400).json({
                    error: `Package not found`
                })
            }
            res.json(package)
        })
}

