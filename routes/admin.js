const express = require("express");
const { body, check } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const adminController = require("../controllers/admin");
const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("title").isLength({ min: 5, max: 400 }).trim(),
  ],
  adminController.postAddProduct
);
router.get("/edit-product/:productId", adminController.getEditProduct);
router.post(
  "/edit-product/",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("title").isLength({ min: 5, max: 400 }).trim(),
  ],
  adminController.postEditProduct
);
router.delete("/product/:productId", adminController.deleteProduct);
router.get("/products", adminController.getProducts);

module.exports = router;
