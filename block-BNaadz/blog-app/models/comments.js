var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Article = require("./articles");
var User = require("./users");


var commentsSchema = new Schema({
    comment: { type: String },
    likes: { type: Number, default: 0 },
    articleId: { type: Schema.Types.ObjectId, ref: "Article" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

var Comment = mongoose.model("Comment", commentsSchema);

module.exports = Comment;