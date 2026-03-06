const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StockHistory = sequelize.define(
  "StockHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    stockId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM("ENTRY", "ADD", "EDIT", "DELETE"),
      allowNull: false
    },
    qtyBefore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    qtyAfter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    buyingPriceBefore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    buyingPriceAfter: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  },
  {
    tableName: "stock_history",
    timestamps: true,
    updatedAt: false
  }
);

module.exports = StockHistory;
