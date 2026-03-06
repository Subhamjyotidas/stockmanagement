const { Item, Stock } = require("../models");
const { Sequelize } = require("sequelize");

exports.getAll = async (req, res) => {
  try {
    const items = await Item.findAll({
      order: [["id", "DESC"]],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT MIN(buyingPrice) 
              FROM stock 
              WHERE stock.itemId = item.id
            )`),
            "buyingPrice"
          ]
        ]
      }
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch failed" });
  }
};

exports.create = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    if (!name) {
      return res.status(400).json({ message: "Item name required" });
    }

    const item = await Item.create(
      { name },
      { fields: ["name"] }
    );

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create failed" });
  }
};

exports.update = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    if (!name) {
      return res.status(400).json({ message: "Item name required" });
    }

    await Item.update(
      { name },
      { where: { id: req.params.id } }
    );

    res.json({ message: "Item updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

exports.remove = async (req, res) => {
  try {
    await Item.destroy({
      where: { id: req.params.id }
    });

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
