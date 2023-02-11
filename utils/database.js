const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

/** @type {mongodb.Db} */
let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://mongotest:mongotest@cluster0.oxhsijr.mongodb.net/?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("Connected to MongoDB cluster!");
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) return _db;
  throw "NO DATABASE FOUND";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
