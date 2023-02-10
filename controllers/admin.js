const User = require("../models/user");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  // const { title, imageURL, description, price } = req.body;
  req.user
    .createProduct({ ...req.body })
    .then((result) => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === "true";
  if (!editMode) return res.redirect("/");

  const id = req.params.productId;

  req.user
    .getProducts({ where: { id: id } })
    .then((products) => {
      if (!products) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: products[0],
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageURL = req.body.imageURL;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;

  Product.findByPk(id)
    .then((product) => {
      product.title = updatedTitle;
      product.description = updatedDescription;
      product.imageURL = updatedImageURL;
      product.price = updatedPrice;
      return product.save();
    })
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.productId;
  Product.findByPk(id)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render("admin/list-products", {
        pageTitle: "Admin Products",
        prods: products,
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};
