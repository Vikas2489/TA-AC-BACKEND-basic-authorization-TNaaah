var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require("./users");

var productSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number },
    image: { type: String },
    category: { type: [String] },
    likes: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    isBlock: { type: Boolean, default: false }
}, { timestamps: true });

var Product = mongoose.model("Product", productSchema);

module.exports = Product;