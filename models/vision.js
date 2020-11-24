const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const SunglassSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        color: String,
        description: String,
    },
    { timestamps: true }
);

const Sunglass = mongoose.model("Sunglass", SunglassSchema);

const VisionSubtypeSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        price: Number,
        description: String,
        sub_type:{
            type:Array,
            default:[SunglassSchema]
        }

    },
    { timestamps: true }
);

const VisionSubtypeItem = mongoose.model("VisionSubtypeItem", VisionSubtypeSchema);

const visionSchema = new mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    price: {
        type: Number
    },
    type: {
        type: String,
        enum: ["vision", "lense"],
        default: "vision"
    },
    subtype: {
        type: Array,
        default: [VisionSubtypeSchema]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Vision", visionSchema);