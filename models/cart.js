const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Cart = sequelize.define("cart", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Cart;
