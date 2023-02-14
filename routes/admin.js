const express = require("express");
const isAuth = require("../middleware/is-auth");
const adminController = require("../controllers/admin");
const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", adminController.postAddProduct);
router.get("/edit-product/:productId", adminController.getEditProduct);
router.post("/edit-product/", adminController.postEditProduct);
router.post("/delete-product/", adminController.postDeleteProduct);
router.get("/products", adminController.getProducts);

module.exports = router;
