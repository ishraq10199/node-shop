const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.post("/logout", authController.postLogout);

module.exports = router;
