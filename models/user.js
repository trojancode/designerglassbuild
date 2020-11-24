const mongoose = require('mongoose');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: 100
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        unique: 13
    },
    address: {
        city:{
            type:String,
            default:null
        },
        district:{
            type:String,
            default:null
        },
        address:{
            type:String,
            default:null
        },
        land_marks:{
            type:String,
            default:null
        },
        state:{
            type:String,
            default:null
        },
    },
    veryfied_phone: {
        type: Boolean,
        default:false,
    },
    veryfied_email: {
        type: Boolean,
        default:false,
    },
    otp: {
        type: String,
        default:null,
    },
    hashed_password: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        trim: true,
    },
    salt: String,
    role: {
        type: Number,
        default: 0
    },
    history: {
        type: Array,
        default: []
    },
    pincode:{
        type: Number,
        maxlength: 6
    },
    duty_orders:{
        type: Array,
        default:[]
    }
}, {
    timestamps: true
});

userSchema.virtual('password')
    
    .set(function (password) {
        console.log(password);
        this._password = password,
        this.salt = uuidv1(),
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function () {
        return this.password
    })

userSchema.methods = {

    authenticate: function(password){
        return this.encryptPassword(password) === this.hashed_password;
    },


    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        }catch(err){
            return "";
        }
    }
};

module.exports = mongoose.model("User", userSchema);