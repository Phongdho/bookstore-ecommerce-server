const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE ORDER. AUTH USERS

router.post("/", verifyToken, async (req, res) => {
  
  try {

    if (!req.body.products) throw new Error("Not able to create order")
    console.log("body nè", req.body.products);
    const productsToUpdate = await Promise.all(
        req.body.products.map(async (request) => {
        const existed = await Product.findById(request.productId);
        console.log("existed", existed);
        let newStock = existed.stock;

        if (request.quantity <= existed.stock) {
          newStock = existed.stock - request.quantity;
        } else {
          console.log(
            "Sold out",
            request.productId.name,
            request.quantity,
            existed.stock
          );
          throw new Error("Sold out product");
        }

        return { _id: existed._id, newStock };
      })
    );
    await Promise.all(
      productsToUpdate.map(async (product) => {
        await Product.findByIdAndUpdate(product._id, {
          stock: product.newStock,
        });
      })
    );
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE ORDER. ONLY ADMIN
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE ORDER. 
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS. AUTH USER
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//GET ALL. ONLY ADMIN
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// GET MONTHLY INCOME. ONLY ADMIN
router.get("/income", verifyTokenAndAdmin, async (req, res) => {

  const productId = req.query.proId;

  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { 
        createdAt: { $gte: previousMonth }, 
        ...(productId && {
        products: {$elemMatch: {productId}},
      }),
     }},
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    // console.log("income", income);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ANNUAL MONTHLY SALES
router.get("/monthlysales", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
      const income = await Order.aggregate([
        { $match: {createdAt: { $gte: lastYear}}},
        {
          $project: {
            month: {$month: "$createdAt"},
            sales: "$amount",
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$sales"},
          },
        },
      ]);
      // console.log("income", income);
      res.status(200).json(income);
  } catch (err) {
      console.log(err);
      res.status(500).json(err);
  }
})

module.exports = router;