const path = require("path");
const http = require("http");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const rootDir = require("./utils/path");

const User = require("./models/user");

const bodyParser = require("body-parser");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const errorController = require("./controllers/error");

const mongoose = require("mongoose");

const app = express();

// --- DATABASE --- //
const MONGODB_URI =
  "mongodb+srv://mongotest:mongotest@cluster0.oxhsijr.mongodb.net/";

// --- SESSION STORAGE --- //
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// --- FILE STORAGE --- //
const fileFilter = (req, file, cb) => {
  const acceptedMimetypes = ["image/png", "image/jpg", "image/jpeg"];
  if (
    acceptedMimetypes.findIndex((mimetype) => file.mimetype === mimetype) >= 0
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    const timestamp = parseInt(
      (new Date("2012.08.10").getTime() / 1000).toFixed(0)
    );
    cb(null, timestamp + "_" + file.originalname);
  },
});

// --- VIEW ENGINE --- //
app.set("view engine", "ejs");
app.set("views", "views");

// --- FORM PARSERS --- //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);

app.use(express.static(path.join(rootDir, "public")));
app.use("/images", express.static(path.join(rootDir, "images")));

// --- SESSION MIDDLEWARE --- //
app.use(
  session({
    secret: "v1HvwigQFUbuIdMDctIXOg==",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// --- CSRF MIDDLEWARE --- //
const csrfProtection = csrf();
app.use(csrfProtection);

// --- CONNECT FLASH --- //
app.use(flash());

// --- DUMMY USER MIDDLEWARE --- //
app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.isLoggedIn = false;
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) return next();
      req.user = new User(user);
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

// --- CSRF + SESSION DATA ON EACH RESPONSE --- ///
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// --- ROUTES --- //
app.use("/admin", adminRoutes);
app.use("/500", errorController.get500);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// --- CENTRAL ERROR HANDLING MIDDLEWARE --- //
app.use((error, req, res, next) => {
  console.log(error);
  // res.redirect("/500");
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
