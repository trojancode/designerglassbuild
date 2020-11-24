
const Prescriptionfile = require('../models/prescriptionfile');
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

exports.prescriptionfileById = (req, res, next, id) => {
    Prescriptionfile.findById(id)
        .exec((err, prescriptionfile) => {
            if (err || !prescriptionfile) {
                return res.status(400).json({
                    error: "Photo not found"
                })
            }
            req.prescriptionfile = prescriptionfile
            next();
        });
};




exports.read = (req, res) => {
    return res.sendFile(__dirname + "/prescription/" + req.prescriptionfile._id+req.prescriptionfile.ext );
};




exports.create = (req, res) => {

    let form = new fromidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        const prescriptionfile = new Prescriptionfile({ user: req.user,ext:path.extname(files.prescription.name) });

        prescriptionfile.save((error, suc) => {
            if (error) {
                return res.status(400).json({
                    error: error,
                });
            } else {
                const tempPath = files.prescription.path;
                const targetPath = __dirname + "/prescription/" + suc.id + path.extname(files.prescription.name);
                fs.rename(tempPath, targetPath, function (err) {
                    if (err) {
                        return res.status(400).json({
                            error: err,
                        });
                    }
                    res.json({
                        suc
                    });
                });
            }
        });

    })
};



exports.remove = (req, res) => {
    let prescriptionfile = req.prescriptionfile
    prescriptionfile.remove((err, deletedProduct) => {
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

