let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let bcrypt = require("bcrypt");
let Article = require("./articles");


let userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 5 },
    city: { type: String },
    articleId: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
}, { timestamps: true });

userSchema.pre("save", function(next) {
    if (this.password && this.isModified("password")) {
        bcrypt.hash(this.password, 10, (err, hash) => {
            if (err) return next(err);
            this.password = hash;
            return next();
        });
    } else {
        return next();
    };
});


userSchema.methods.getFullame = function(firstName, lastName) {
    return firstName + lastName;
};

userSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, (err, result) => {
        return cb(err, result);
    });
};


let User = mongoose.model("User", userSchema);

module.exports = User;