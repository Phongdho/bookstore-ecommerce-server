const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema (
    {
        title: {type: String, required: true, unique: true},
        highlight: {type: String, required: true}, //awards, noticeable book details in bold
        desc: {type: String, required: true},
        img: {type: String, required: true},
        author: {type: String, required: true},
        pageNum: {type: Number, required: false},
        categories: {type: Array},
        stock: {type: Number, required: true},
        price: {type: Number, required: true},
    }, {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", ProductSchema);