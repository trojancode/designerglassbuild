const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const ImageSchema = new mongoose.Schema({
    product: { type: ObjectId, ref: "Product" },
}, {
    timestamps: true
});

module.exports = mongoose.model("Image", ImageSchema);