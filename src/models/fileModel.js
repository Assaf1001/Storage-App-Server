const mongoose = require("mongoose");

const fileScehma = new mongoose.Schema(
    {
        originalName: { type: String },
        storageName: { type: String },
        bucket: { type: String },
        region: { type: String },
        key: { type: String },
        location: { type: String },
        type: { type: String },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: "User",
        },
    },
    { timestamps: true }
);

const File = mongoose.model("File", fileScehma);

module.exports = File;
