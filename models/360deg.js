const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const three60degSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    photos: {
        type: Array,
        default: [ObjectId]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("360deg", three60degSchema);