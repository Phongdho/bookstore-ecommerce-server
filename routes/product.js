const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const Product = require("../models/Product");
const router = require("express").Router();

//CREATE PRODUCT. ONLY ADMIN
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    const newProduct = new Product(req.body);
    try {
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
})

//UPDATE PRODUCT. ONLY ADMIN
router.put("/:id", async (req, res) => {
    const updateObject = {};
    // console.log(req.body,'body');
    const {title, price, stock, img} = req.body
    // console.log(title, price, stock, img);
    if(title){
        updateObject.title = title
    }
    if(price){
        updateObject.price = price
    }
    if(stock){
        updateObject.stock = stock
    }
    if(img){
        updateObject.img = img
    }
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            updateObject,
            {new: true}
        );
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE PRODUCT. ONLY ADMIN
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json("Product has been deleted!");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET SINGLE PRODUCT. ALL USERS
router.get("/find/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL PRODUCTS. ALL USERS
router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    const qTitle = req.query.title;
    try {
        let products;
        
        if (qNew) {
            products = await Product.find().sort({createdAt: -1}).limit(5);
        } else if (qCategory) {
            products = await Product.find({categories: {
                $in: [qCategory],
            },
        });
        } else if (qTitle) {
            products = await Product.find({title: qTitle});
        } else {
            products = await Product.find();
        }
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;