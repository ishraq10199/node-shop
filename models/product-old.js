// const rootDir = require("../utils/path");
// const path = require("path");
// const fs = require("fs");
// const Cart = require("./cart");
// const db = require("../utils/database");

// const p = path.join(rootDir, "data", "products.json");

// const getProductsFromFile = (cb) => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) return cb([]);
//     return cb(JSON.parse(fileContent));
//   });
// };

// module.exports = class Product {
//   constructor(_id, _title, _imageURL, _description, _price) {
//     this.id = _id;
//     this.title = _title;
//     this.imageURL = _imageURL;
//     this.description = _description;
//     this.price = _price;
//   }

//   save() {
//     return db.execute(
//       "INSERT INTO products (title, description, imageURL, price) VALUES (?,?,?,?)",
//       [this.title, this.description, this.imageURL, this.price]
//     );
//   }
//   static fetchAll() {
//     return db.execute("SELECT * FROM products");
//   }
//   static findById(id) {
//     return db.execute("SELECT * FROM products WHERE products.id = ?", [id]);
//   }
//   static deleteById(id, cb) {}

// // ---- DEPRECATED: USING FILE SYSTEM AND JSON FILES ---- //
// save() {
//   getProductsFromFile((products) => {
//     if (this.id) {
//       const existingProductIndex = products.findIndex(
//         (prod) => prod.id === this.id
//       );
//       const updatedProducts = [...products];
//       updatedProducts[existingProductIndex] = this;
//       fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//         console.log(err);
//       });
//     } else {
//       this.id = Math.floor(
//         Math.random() * Number.MAX_SAFE_INTEGER
//       ).toString();
//       products.push(this);
//       fs.writeFile(p, JSON.stringify(products), (err) => {
//         console.log(err);
//       });
//     }
//   });
// }

// static fetchAll(cb) {
//   return getProductsFromFile(cb);
// }

// static findById(id, cb) {
//   getProductsFromFile((products) => {
//     const product = products.find((prod) => prod.id === id);
//     cb(product);
//   });
// }

// static deleteById(id, cb) {
//   getProductsFromFile((products) => {
//     const product = products.find((prod) => prod.id === id);
//     const updatedProducts = products.filter((prod) => prod.id !== id);
//     fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//       if (!err) {
//         Cart.deleteProduct(id, product.price);
//       }
//       console.log(err);
//     });
//   });
// }
// };
