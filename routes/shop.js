const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.postCartDeleteProduct);
router.get("/orders", isAuth, shopController.getOrders);
router.post("/create-order", shopController.postOrder);
router.get("/products/:productId", isAuth, shopController.getProductById);
router.get("/products", isAuth, shopController.getProducts);
// router.get("/checkout", shopController.getCheckout);

module.exports = router;
