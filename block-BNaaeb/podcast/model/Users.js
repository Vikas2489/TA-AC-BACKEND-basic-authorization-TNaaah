var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var usersSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, minlength: 5, required: true },
    isAdmin: { type: Boolean, default: false },
    userType: { type: String }
}, { timestamps: true });

usersSchema.pre('save', function(next) {
    if (this.password && this.isModified('password')) {
        bcrypt.hash(this.password, 8, (err, hashed) => {
            if (err) return next(err);
            this.password = hashed;
            return next();
        })
    } else {
        next();
    }
});

usersSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result);
    });
}

var User = mongoose.model("User", usersSchema);

module.exports = User;