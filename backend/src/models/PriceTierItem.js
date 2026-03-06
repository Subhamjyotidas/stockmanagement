const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PriceTierItem = sequelize.define(
  "price_tier_items",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    priceTierId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "price_tier_items",
    timestamps: true
  }
);

module.exports = PriceTierItem;