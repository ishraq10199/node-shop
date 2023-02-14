const Product = require("../models/product");
const Order = require("../models/order");

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        pageTitle: "Shop",
        prods: products,
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        pageTitle: "All Products",
        prods: products,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProductById = (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect("/404");
      }
      res.render("shop/product-detail", {
        pageTitle: "Product Detail",
        path: "/products",
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: user.cart.items,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart(productId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      });
      // res.send(orders);
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc },
        };
      });
      console.log(products);
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

// // exports.getCheckout = (req, res, next) => {
// //   res.render("shop/checkout", {
// //     pageTitle: "Checkout",
// //     path: "/checkout",
// //   });
// // };
