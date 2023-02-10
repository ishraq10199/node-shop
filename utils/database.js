const Sequelize = require("sequelize").Sequelize;
const sequelize = new Sequelize("node-shop", "root", "password1234", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
