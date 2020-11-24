const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const prescriptionfileSchema = new mongoose.Schema({
    user: { type: ObjectId, ref: "User",},
    ext:{
        type:String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Prescriptionfile", prescriptionfileSchema);