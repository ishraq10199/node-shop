// const { ObjectId } = require("mongodb");
const path = require("path");
const { ObjectID } = require("bson");
const { validationResult } = require("express-validator");
const Product = require("../models/product");
const fileHelper = require("../utils/file");
const rootDir = require("../utils/path");

const ITEMS_PER_PAGE = 3;

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  // const { title, description, imageURL, price } = req.body;

  const product = new Product({
    ...req.body,
    userId: req.user,
    imageURL: "/" + req.file.path,
  });

  if (!req.file) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: true,
      product: product,
      hasError: false,
      errorMessage: "Wrong filetype. Please use an image instead.",
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      product: product,
      hasError: true,
      errorMessage: errors.array()[0].msg,
    });
  }

  product
    .save()
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === "true";
  if (!editMode) return res.redirect("/");

  const id = req.params.productId;

  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.file;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;

  const errors = validationResult(req);

  console.log(updatedImage);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: true,
      product: {
        productId: productId,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
      },
      hasError: true,
      errorMessage: errors.array()[0].msg,
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/404");
      }
      product.title = updatedTitle;
      product.description = updatedDescription;

      // ONLY SET NEW IMAGE IF INPUT FILE GIVEN
      if (updatedImage) {
        fileHelper.deleteFile(path.join(rootDir, product.imageURL));
        product.image = "/" + updatedImage.path;
      }
      product.price = updatedPrice;
      product.userId = req.user;
      return product.save().then((result) => {
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        res.status(500).json({ message: "product not found" });
      }
      fileHelper.deleteFile(path.join(rootDir, product.imageURL));
      return Product.deleteOne({ _id: productId, userId: req.user._id });
    })
    .then((result) => {
      res.status(200).json({ message: "success" });
    })
    .catch((err) => {
      res.status(500).json({ message: "deletion failed" });
    });
};

exports.getProducts = (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  let numberOfPages;

  Product.find({ userId: req.user._id })
    .count()
    .then((numProducts) => {
      numberOfPages = Math.ceil(numProducts / ITEMS_PER_PAGE);
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("admin/list-products", {
        pageTitle: "Admin Products",
        prods: products,
        path: "/admin/products",
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
