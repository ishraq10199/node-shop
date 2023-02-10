const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Order;
