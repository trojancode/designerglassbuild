const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    brand: { type: ObjectId, ref: "Brand" },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    price: {
        type: Number,
        trim: true,
        required: true,
        maxlength: 32
    },
    category: {
        type: ObjectId,
        ref: 'Category',
        required: true
    },
    quantity: {
        type: Number
    },
    featured: {
        type: Boolean,
        default: false
    },
    offer: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    photo: {
        type:Array,
        default:[ObjectId]
    },
    try_home: {
        required: false,
        type: Boolean
    },
    group: {
        type: String,
        default: null,
        enum: ["Frame","Sunglass","Unisex","Kids","Boys","Girl"]
    },
    gender: {
        type: String,
        default: null,
        enum: ["Gents","Ladies","Unisex","Kids","Boys","Girl"]
    },
    shape: {
        type: String,
        default: null,
        enum: ["Square","Round","Hexagonal","Aviator"]
    },
    material: {
        type: String,
        default: null,
        enum: ["Plastic","Metal","Acetate","Stainless Steel","Titanium"]
    },
    frame_type: {
        type: String,
        default: null,
        enum: ["Full Rim","Supra","Rimless"]
    },
    hing:{
        type: String,
        default: null,
        enum: ["Hinged","Spring"]
    },
    color: {
        type: String,
        default: null,
    },
    variants:{
        type:Array,
        default:[]
    },
    review:{
        type:Array,
        default:[]
    },
    // {
    //     productId:"",
    //     color:"",
    // }
    rating: {
        type: Array,
        default: [Number]
    },
    diemension:{
        width:{
            type:Number,
        },
        temple:{
            type:Number,
        },
        lens_height:{
            type:Number,
        },
        lens_width:{
            type:Number,
        },
        bridge:{
            type:Number,
        }
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);