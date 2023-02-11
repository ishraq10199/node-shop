const path = require("path");
const http = require("http");
const express = require("express");

const rootDir = require("./utils/path");

const User = require("./models/user");

const bodyParser = require("body-parser");
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const errorController = require("./controllers/error");

const { mongoConnect } = require("./utils/database");

const app = express();

// --- VIEW ENGINE --- //
app.set("view engine", "ejs");
app.set("views", "views");

// --- BODY PARSER --- //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));

// --- DUMMY USER MIDDLEWARE --- //

app.use((req, res, next) => {
  User.findById("63e7080a4ad49e092b0225d7")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      console.log(req.user);
      next();
    })
    .catch((err) => console.log(err));
});

// ----------------------------- //

// --- ROUTES --- //
app.use("/", shopRoutes);
app.use("/admin", adminRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  console.log("App started on port 3000");
  app.listen(3000);
});
