const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Transport = require("nodemailer-sendinblue-transport");
const crypto = require("crypto");
const User = require("../models/user");

const transporter = nodemailer.createTransport(
  new Transport({
    apiKey:
      "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",
  })
);

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: req.flash("error").toString(),
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doesMatch) => {
          if (doesMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            // ONLY PROCEED ONCE SESSION IS CREATED AND STORED IN DB
            return req.session.save((err) => {
              console.log(err);
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    isAuthenticated: false,
    errorMessage: req.flash("error").toString(),
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email }).then((userDoc) => {
    if (userDoc) {
      req.flash("error", "Email already exists. Try another.");
      return res.redirect("/signup");
    }
    return bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] },
        });
        return user.save();
      })
      .then((result) => {
        return transporter
          .sendMail({
            to: email,
            from: "shop@nodeshop.com",
            subject: "Signup successful!",
            html: "<h1> You successfully signed up </h1>",
          })
          .then((result) => {
            return res.redirect("/login");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => console.log(err));
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    isAuthenticated: false,
    errorMessage: req.flash("error").toString(),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        transporter.sendMail({
          to: req.body.email,
          from: "shop@nodeshop.com",
          subject: "Password reset",
          html: `
            <p>You requested a password reset</p>
            <p>Click <a href="http://localhost:3000/reset/${token}">this link</a> to set a new password.</p>
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash(
          "error",
          "Your password reset token has expired. Cannot change your password."
        );
        return res.render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: req.flash("error").toString(),
        });
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Update Password",
        isAuthenticated: false,
        errorMessage: req.flash("error").toString(),
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
