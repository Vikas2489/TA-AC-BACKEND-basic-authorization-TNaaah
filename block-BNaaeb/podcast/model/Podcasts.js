var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require("../model/Users");

var podcastsSchema = new Schema({
    name: { type: String, required: true },
    image: String,
    description: String,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    likes: { type: Number, default: 0 },
    podcastsType: String,
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

var Podcast = mongoose.model("Podcast", podcastsSchema);

module.exports = Podcast;