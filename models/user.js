const { ObjectId } = require("mongodb");
const getDb = require("../utils/database").getDb;

class User {
  constructor(_username, _email, _cart, __id) {
    this.name = _username;
    this.email = _email;
    this.cart = _cart ? _cart : { items: [] };
    this._id = __id ? new ObjectId(__id) : null;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection("users")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db
        .collection("users")
        .insertOne(this)
        .then((result) => console.log("Inserted new user"))
        .catch((err) => console.log(err));
    }
    return dbOp;
  }

  addToCart(product) {
    // Check if product already in cart
    const cartProductIndex = this.cart.items.findIndex((eachCartItem) => {
      return eachCartItem.productId.toString() === product._id.toString();
    });

    const updatedCartItems = [...this.cart.items];
    let newQuantity = 1;
    if (cartProductIndex >= 0) {
      newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({ productId: product._id, quantity: newQuantity });
    }

    const updatedCart = { items: updatedCartItems };
    const db = getDb();
    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } })
      .then((result) => console.log("Added product to cart"))
      .catch((err) => console.log(err));
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => ({
          ...p,
          quantity: this.cart.items.find((eachCartItem) => {
            return eachCartItem.productId.toString() === p._id.toString();
          }).quantity,
        }));
      })
      .catch((err) => console.log(err));
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: this._id },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDb();

    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: this._id,
            name: this.name,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
      });
  }

  getOrders() {
    const db = getDb();
    return db.collection("orders").find({ "user._id": this._id }).toArray();
  }

  static findById(userId) {
    const db = getDb();
    let objectId;

    // If a weird ID is given, and does not match the 12 byte format,
    // return a resolved promise back to the controller,
    // this results in a 404
    try {
      objectId = new ObjectId(userId);
    } catch (e) {
      return Promise.resolve(null);
    }

    return db
      .collection("users")
      .findOne({ _id: objectId })
      .then((user) => {
        return user;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
