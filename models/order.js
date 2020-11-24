const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: "Product" },
    name: String,
    price: Number,
    qty_type: String,
    count: Number,
    offer: Number
  },
  { timestamps: true }
);

const CartItem = mongoose.model("CartItem", CartItemSchema);

const OrderSchema = new mongoose.Schema(
  {
    products: [CartItemSchema],
    order_id: {type:String},
    amount: { type: Number },
    address: {
      city: {
        type: String,
        default: null
      },
      address: {
        type: String,
        default: null
      },
      country: {
        type: String,
        default: null
      },
      street: {
        type: String,
        default: null
      },
      flatno: {
        type: String,
        default: null
      },
    },
    pincode: {
      type: Number,
      default: 000000,
      maxlength: 6
    },
    order_type: {
      type: String,
      enum: ["Buy", "Try"],
      default: "Buy"
    },
    paid: { type: Number, default: 0 },
    payment_method: {
      type: String,
      enum: ["Cash On Delivery", "Online Payment", "Notdefined"],
      default: "Online Payment"
    },// enum means string objects,
    isPaid: { type: Boolean, default: false },
    status: {
      type: String,
      default: "Not processed",
      enum: ["Not processed", "Processing", "Shipped", "Delivered", "Cancelled"] // enum means string objects
    },
    updated: Date,
    user: { type: ObjectId, ref: "User" },
    dboy: {
      type: ObjectId, ref: "User",
      default: null
    },
    lense: {
      lens_option: {
        type: String,
        default: null
      },
      lens_option_selected: {
        type: String,
        default: null
      },
      lens_option_selected_subtype: {
        type: String,
        default: null
      },
      vision: {
        type: String,
        default: null
      },
      vision_selected: {
        type: String,
        default: null
      },
      package: {
        type: ObjectId, ref: "Package",
      },

    },
    prescription: {
      prescription_type: {
        type: String,
        enum: ["Enter", "Upload", "Send", "Notdefined"],
        default: "Notdefined"
      },
      left_eye: {
        sphere_SPH: {
          type: String,
        },
        cylinder_CYL: {
          type: String,
        },
        Axis_X: {
          type: String,
        },
        Near_Add: {
          type: String,
        },
        pd: {
          type: String,
        },
      },
      right_eye: {
        sphere_SPH: {
          type: String,
        },
        cylinder_CYL: {
          type: String,
        },
        Axis_X: {
          type: String,
        },
        Near_Add: {
          type: String,
        },
        pd: {
          type: String,
        },
      },
      pd_type: {
        type: String,
        enum: ["One", "Two", "No", "Notdefined"],
        default: "Notdefined"
      },
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order, CartItem };