const router = require ("express").Router();
// const KEY = process.env.STRIPE_KEY
const Stripe = require("stripe");
const stripe = Stripe('sk_test_51K560gAf2hsvDbFS1F33owtpdHBSMgDnxLHwFypyutM9VfcyTMLTVA6iH3XKZ5tiZ7nDG9dS1nwIQ0V6b9EDzRB700xz2Itlxx');

router.post("/payment", (req, res) => {
    stripe.charges.create({
        source: req.body.tokenId,
        amount: req.body.amount,
        currency: "vnd",
    }, (stripeErr, stripeRes) => {
        if (stripeErr){
            res.status(500).json(stripeErr);
            console.log("error", stripeErr);
        } else {
            res.status(200).json(stripeRes);
        }
    })
})
module.exports = router;