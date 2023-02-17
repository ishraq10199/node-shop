const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");

const router = express.Router();
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    // EMAIL CHECK FORMAT
    check("email")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),

    // PASSWORD LENGTH CHECK
    body("password", "Invalid password.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    // EMAIL CHECK FORMAT AND AVAILIBILITY
    check("email")
      .isEmail()
      .withMessage("Invalid email address")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists. Pick another.");
          }
        });
      })
      .normalizeEmail(),

    // PASSWORD LENGTH AND ALPHANUMERIC CHECKS
    body(
      "password",
      "Please enter a password with only numbers, letters, and at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),

    // CONFIRMPASSWORD EQUALITY CHECK
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);

router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.post("/logout", authController.postLogout);

module.exports = router;
