const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const packageSchema = new mongoose.Schema({
    name: {
        type: String
    },
    price: {
        type: Number,
    },
    properties: {
        type: Array,
        default:[Number]
    },
    color:{
        type:String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Package", packageSchema);