const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema (
    {
        reviewer: {type: Schema.Types.ObjectId, ref: "User", required: true},
        content: {type: String, required: true},
        targetProduct: {type: Schema.Types.ObjectId, ref: "Product", required: true},
        isDeleted: {type: Boolean, default: false},
    }, {
        timestamps: true
    }
);

module.exports = mongoose.model("Review", ReviewSchema);