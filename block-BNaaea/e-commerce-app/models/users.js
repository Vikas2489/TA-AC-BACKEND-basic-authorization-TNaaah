var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Product = require("./products");
var bcrypt = require("bcrypt");

var usersSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, minlength: 5 },
    cart: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isAdmin: { type: Boolean, default: false },
}, {
    timestamps: true
});

usersSchema.pre("save", function(next) {
    if (this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if (err) return next(err);
            this.password = hashed;
            return next();
        })
    } else {
        return next();
    }
});

usersSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result);
    });
}


module.exports = mongoose.model("User", usersSchema);