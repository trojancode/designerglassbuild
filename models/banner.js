const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const bannerSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    photo: {
        data: Buffer,
        contentType: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Banner", bannerSchema);