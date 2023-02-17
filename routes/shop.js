const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", shopController.postCart);
router.post("/cart-delete-item", shopController.postCartDeleteProduct);
router.get("/orders/:orderId", isAuth, shopController.getOrderInvoice);
router.get("/orders", isAuth, shopController.getOrders);

router.get("/products/:productId", shopController.getProductById);
router.get("/products", shopController.getProducts);

router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", isAuth, shopController.getCheckout);
router.get("/checkout", isAuth, shopController.getCheckout);

module.exports = router;
