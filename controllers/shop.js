const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// STRIPE SECRET KEY
const stripe = require("stripe")(process.env.STRIPE_KEY);

const rootdir = require("../utils/path");
const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 3;

exports.getIndex = (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  let numberOfPages;

  Product.find()
    .count()
    .then((numProducts) => {
      numberOfPages = Math.ceil(numProducts / ITEMS_PER_PAGE);
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        pageTitle: "Shop",
        prods: products,
        path: "/",
        numberOfPages: numberOfPages,
        hasNextPage: page < numberOfPages,
        hasPreviousPage: page > 1,
        currentPage: page,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  let numberOfPages;

  Product.find()
    .count()
    .then((numProducts) => {
      numberOfPages = Math.ceil(numProducts / ITEMS_PER_PAGE);
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        pageTitle: "All products",
        prods: products,
        path: "/products",
        numberOfPages: numberOfPages,
        hasNextPage: page < numberOfPages,
        hasPreviousPage: page > 1,
        currentPage: page,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart(productId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrderInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceFilename = "invoice - " + orderId + ".pdf";
      const invoiceFilepath = path.join(
        rootdir,
        "data",
        "invoices",
        invoiceFilename
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="' + invoiceFilename + '"'
      );

      // --- CREATE A NEW PDF FILE --- //
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoiceFilepath));
      pdfDoc.pipe(res);

      // TODO: prettify formatting //

      pdfDoc.fontSize(26).text("Invoice");

      pdfDoc
        .fontSize(12)
        .text(
          "---------------------------------------------------------------------------------------------------------------------\n\n\n"
        );

      let totalPrice = 0;
      order.products.forEach((productDetail, idx) => {
        totalPrice += productDetail.quantity * productDetail.product.price;
        pdfDoc.text(
          idx +
            1 +
            ". " +
            productDetail.product.title +
            " - " +
            productDetail.quantity +
            " x " +
            "$ " +
            productDetail.product.price
        );
      });

      pdfDoc
        .fontSize(12)
        .text(
          "\n\n---------------------------------------------------------------------------------------------------------------------"
        );

      pdfDoc.text("Total Price: $ " + totalPrice, {
        align: "right",
      });

      pdfDoc
        .fontSize(12)
        .text(
          "---------------------------------------------------------------------------------------------------------------------"
        );

      pdfDoc.end();

      // // --- READ WHOLE FILE AND SEND RESPONSE --- //
      // fs.readFile(invoiceFilepath, (err, fileData) => {
      //   if (err) return next(err);
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'attachment; filename="' + invoiceFilename + '"'
      //   );
      //   res.send(fileData);
      // });

      // --- Stream the data instead --- //
      // const filestream = fs.createReadStream(invoiceFilepath);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader(
      //   "Content-Disposition",
      //   'attachment; filename="' + invoiceFilename + '"'
      // );
      // --- Pipe the readable stream (filestream) to the writeable stream (res) --- //
      // filestream.pipe(res);
    })
    .catch((err) => next(err));
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      total = products.reduce(
        (totalCost, productDetails) =>
          totalCost + productDetails.quantity * productDetails.productId.price,
        0
      );

      // STRIPE
      return stripe.checkout.sessions.create({
        mode: "payment",
        line_items: products.map((p) => {
          return {
            quantity: p.quantity,
            price_data: {
              unit_amount: p.productId.price * 100,
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
              currency: "usd",
            },
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((stripeSession) => {
      res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout",
        products: products,
        totalSum: total,
        sessionId: stripeSession.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc },
        };
      });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
