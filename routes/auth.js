const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");


//USER REGISTER. ALL USERS
router.post("/register", async (req,res) => {
    const newUser = new User ({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(
            req.body.password, 
            process.env.PASS_SEC
        ).toString(),
    });
    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

//USER LOGIN. ALL USERS
router.post("/login", async (req,res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        //Check credentials
        !user && res.status(401).json("Wrong credentials!");
        const hashedPassword = CryptoJS.AES.decrypt(
            user.password, 
            process.env.PASS_SEC
        );
        //Hash password again
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        //Check credentials
        originalPassword !== req.body.password && res.status(401).json("Wrong credentials!");
        
        //Access Token is valid only for 1 day
        const accessToken = jwt.sign(
            {
            id: user._id,
            isAdmin: user.isAdmin,
            }, 
            process.env.JWT_SEC,
            {expiresIn:"1d"} 
        );
        //Hide password field
        const {password, ...others} = user._doc;

        res.status(200).json({...others, accessToken});
    } catch (err) {
        res.status(500).json(err);
    }
})
module.exports = router;