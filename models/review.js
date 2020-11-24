const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const reviewSchema = new mongoose.Schema({
    product: {
        type: ObjectId, ref: "Product" 
    },
    user: {
        type: ObjectId, ref: "User" 
    },
    user_name: {
        type: String
    },
    content: {
        type: String,
    },
    rating: {
        type: Number,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);