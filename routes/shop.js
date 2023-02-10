const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);
router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.postCartDeleteProduct);
router.get("/orders", shopController.getOrders);
router.post("/create-order", shopController.postOrder);
router.get("/products/delete", shopController.deleteProduct);
router.get("/products/:productId", shopController.getProductById);
router.get("/products", shopController.getProducts);
router.get("/checkout", shopController.getCheckout);

module.exports = router;
