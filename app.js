const path = require("path");
const http = require("http");
const express = require("express");

const rootDir = require("./utils/path");

const bodyParser = require("body-parser");
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const errorController = require("./controllers/error");

const sequelize = require("./utils/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();

// --- VIEW ENGINE --- //
app.set("view engine", "ejs");
app.set("views", "views");

// --- BODY PARSER --- //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));

// --- DUMMY USER MIDDLEWARE --- //

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// ----------------------------- //

// --- ROUTES --- //
app.use("/", shopRoutes);
app.use("/admin", adminRoutes);

app.use(errorController.get404);

// --- sync models and start express server --- //

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      // create new user
      return User.create({ name: "Sam", email: "test@gmail.com" });
    }
    return user;
  })
  .then((user) => {
    return user.createCart();
  })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.error(err);
  });
