// const fs = require("fs");
// const path = require("path");
// const rootDir = require("../utils/path");

// const c = path.join(rootDir, "data", "cart.json");

// const getCartFromFile = (cb) => {
//   fs.readFile(c, (err, fileContent) => {
//     if (err) return cb({ products: [], totalPrice: 0 });
//     else {
//       try {
//         return cb(JSON.parse(fileContent));
//       } catch (err) {
//         return cb({ products: [], totalPrice: 0 });
//       }
//     }
//   });
// };

// module.exports = class Cart {
//   static addProduct(id, productPrice) {
//     let cart = { products: [], totalPrice: 0 };
//     // Fetch prev. cart
//     getCartFromFile((cart) => {
//       const existingProductIndex = cart.products.findIndex(
//         (prod) => prod.id === id
//       );
//       const existingProduct = cart.products[existingProductIndex];
//       let updatedProduct;
//       // If product already in cart, increase qty and update cart
//       if (existingProduct) {
//         updatedProduct = { ...existingProduct };
//         updatedProduct.qty = updatedProduct.qty + 1;
//         cart.products = [...cart.products];
//         cart.products[existingProductIndex] = updatedProduct;
//       } else {
//         // Else, set qty to 1 and insert to cart
//         updatedProduct = { id: id, qty: 1 };
//         cart.products = [...cart.products, updatedProduct];
//       }
//       //   ALWAYS Increase
//       cart.totalPrice = cart.totalPrice + +productPrice;
//       fs.writeFile(c, JSON.stringify(cart), (err) => {
//         console.log(err);
//       });
//     });
//   }

//   static deleteProduct(id, productPrice) {
//     getCartFromFile((cart) => {
//       const updatedCart = { ...cart };
//       const product = cart.products.find((prod) => prod.id === id);
//       if (product) {
//         const productQty = product.qty;
//         updatedCart.products = updatedCart.products.filter(
//           (prod) => prod.id !== id
//         );
//         updatedCart.totalPrice =
//           updatedCart.totalPrice - productPrice * productQty;

//         fs.writeFile(c, JSON.stringify(updatedCart), (err) => {
//           console.log(err);
//         });
//       }
//     });
//   }

//   static getCart = getCartFromFile;
// };
