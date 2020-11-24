const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    featured: {
        type: Boolean,
        default: false
    },
    photo: {
        data: Buffer,
        contentType: String
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Brand", brandSchema);