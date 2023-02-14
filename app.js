const path = require("path");
const http = require("http");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

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

// --- VIEW ENGINE --- //
app.set("view engine", "ejs");
app.set("views", "views");

// --- BODY PARSER --- //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));

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
      req.user = new User(user);
      next();
    })
    .catch((err) => console.log(err));
});

// --- CSRF + SESSION DATA ON EACH RESPONSE --- ///
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// --- ROUTES --- //
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
