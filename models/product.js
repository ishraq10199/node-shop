const { ObjectId } = require("mongodb");
const getDb = require("../utils/database").getDb;

class Product {
  constructor(_title, _description, _imageURL, _price, _userId, __id) {
    this.title = _title;
    this.description = _description;
    this.imageURL = _imageURL;
    this.price = +_price;
    this.userId = _userId;
    this._id = __id ? new ObjectId(__id) : null;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      // Product already in db, so UPDATE
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db
        .collection("products")
        .insertOne(this)
        .then((result) => console.log(result))
        .catch((err) => {
          console.log(err);
        });
    }
    return dbOp;
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        // console.log(products);
        return products;
      })
      .catch((err) => console.log(err));
  }

  static findById(id) {
    const db = getDb();

    let objectId;

    // If a weird ID is given, and does not match the 12 byte format,
    // return a resolved promise back to the controller,
    // this results in a 404

    try {
      objectId = new ObjectId(id);
    } catch (e) {
      return Promise.resolve(null);
    }

    return db
      .collection("products")
      .find({ _id: objectId })
      .next()
      .then((product) => {
        return product;
      })
      .catch((err) => console.log(err));
  }

  static deletebyId(id) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) })
      .then((result) => console.log("Product deleted"))
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
