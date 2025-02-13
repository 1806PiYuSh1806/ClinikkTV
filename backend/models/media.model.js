const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MediaSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["video", "audio"],
        required: true,
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const mediaModel = mongoose.model("Media", MediaSchema);

module.exports = mediaModel;