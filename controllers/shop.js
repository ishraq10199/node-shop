const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((result) => {
      res.render("shop/product-list", {
        pageTitle: "All Products",
        prods: result,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProductById = (req, res, next) => {
  const id = req.params.productId;
  Product.findByPk(id)
    .then((product) => {
      if (product.length == 0) {
        return res.redirect("/404");
      }
      res.render("shop/product-detail", {
        pageTitle: "Product Detail",
        path: "/products",
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.deleteProduct = (req, res, next) => {};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          res.render("shop/cart", {
            pageTitle: "Your Cart",
            path: "/cart",
            products: products,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const id = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: id } });
    })
    .then((products) => {
      // isolate product if exists in cart
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      // product was found in cart, update quantity
      if (product) {
        newQuantity = product.cartItem.quantity + 1;
        return product;
      }
      // don't care if its in cart, return product from products table
      return Product.findByPk(id);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const id = req.body.productId;

  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: id } });
    })
    .then((products) => {
      if (products.length > 0) {
        const product = products[0];
        return product.cartItem.destroy();
      }
      return null;
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch();
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          return order.addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch((err) => console.log(err));
    })
    .then((result) => {
      return fetchedCart.setProducts(null);
    })
    .then((result) => {
      return res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((result) => {
      res.render("shop/index", {
        pageTitle: "Shop",
        prods: result,
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};
