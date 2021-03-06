const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    // const {token} = req.body
    // console.log("auth nè", req.headers.token);
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        // console.log("token nè", token)
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) res.status(403).json("Token is not valid!");
            req.user = user;
            next();
        })
    } else {
        return res.status(401).json("You are not authenticated");
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req,res,() => {
        // console.log(req.user.id);
        // console.log(req.params.userId)
        if (req.user.id === req.params.userId || req.user.isAdmin) {
            // req.currentUser = req.user;
            next();
        } else {
            res.status(403).json("You are not authorized to such task!");
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {

    verifyToken(req,res,() => {
        // console.log(req.user);
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not authorized to such task!");
        }
    })
}
module.exports = {verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin};