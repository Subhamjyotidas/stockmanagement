const { Stock, StockHistory, Item } = require("../models");

/* =========================
   GET STOCK HISTORY
========================= */
exports.getHistory = async (req, res) => {
  try {
    const itemId = req.query.itemId ? Number(req.query.itemId) : null;

    const where = {};
    if (itemId) where.itemId = itemId;

    const rows = await StockHistory.findAll({
      where,
      include: [{ model: Item, as: "item", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]]
    });

    const data = rows.map(r => ({
      id: r.id,
      stockId: r.stockId,
      itemId: r.itemId,
      itemName: r.item?.name || "",
      action: r.action,
      qtyBefore: r.qtyBefore,
      qtyAfter: r.qtyAfter,
      buyingPriceBefore: r.buyingPriceBefore,
      buyingPriceAfter: r.buyingPriceAfter,
      createdAt: r.createdAt
    }));

    res.json(data);
  } catch (err) {
    console.error("STOCK HISTORY ERROR:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* =========================
   GET ALL STOCK
========================= */
exports.getAll = async (req, res) => {
  try {
    const stock = await Stock.findAll({
      include: [
        {
          model: Item,
          as: "item" // ⭐ REQUIRED ALIAS
        }
      ],
      order: [["id", "DESC"]]
    });

    res.json(stock);
  } catch (err) {
    console.error("STOCK FETCH ERROR:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* =========================
   CREATE / MERGE STOCK
========================= */
exports.create = async (req, res) => {
  try {
    const itemId = Number(req.body.itemId);
    const qty = Number(req.body.qty);
    const buyingPrice = Number(req.body.buyingPrice);

    if (!itemId || !qty || !buyingPrice) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // 🔍 SAME ITEM + SAME BUYING PRICE
    const existing = await Stock.findOne({
      where: { itemId, buyingPrice }
    });

    if (existing) {
      const qtyBefore = Number(existing.qty);
      const qtyAfter = qtyBefore + qty;
      existing.qty = qtyAfter;
      await existing.save();

      await StockHistory.create({
        stockId: existing.id,
        itemId,
        action: "ADD",
        qtyBefore,
        qtyAfter,
        buyingPriceBefore: existing.buyingPrice,
        buyingPriceAfter: existing.buyingPrice
      });

      return res.json({
        message: "Stock quantity updated",
        stock: existing
      });
    }

    // 🆕 NEW STOCK ENTRY
    const stock = await Stock.create({
      itemId,
      qty,
      buyingPrice
    });

    await StockHistory.create({
      stockId: stock.id,
      itemId,
      action: "ENTRY",
      qtyBefore: 0,
      qtyAfter: qty,
      buyingPriceBefore: null,
      buyingPriceAfter: buyingPrice
    });

    res.json({
      message: "Stock added",
      stock
    });

  } catch (err) {
    console.error("STOCK CREATE ERROR:", err);
    res.status(500).json({ message: "Create failed" });
  }
};

/* =========================
   UPDATE STOCK
========================= */
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const qty = Number(req.body.qty);
    const buyingPrice = Number(req.body.buyingPrice);

    if (req.body.qty === undefined || req.body.qty === null ||
        req.body.buyingPrice === undefined || req.body.buyingPrice === null ||
        isNaN(qty) || isNaN(buyingPrice) ||
        qty < 0 || buyingPrice < 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const before = await Stock.findByPk(id);
    if (!before) {
      return res.status(404).json({ message: "Stock not found" });
    }

    await Stock.update(
      { qty, buyingPrice },
      { where: { id } }
    );

    await StockHistory.create({
      stockId: id,
      itemId: before.itemId,
      action: "EDIT",
      qtyBefore: before.qty,
      qtyAfter: qty,
      buyingPriceBefore: before.buyingPrice,
      buyingPriceAfter: buyingPrice
    });

    res.json({ message: "Stock updated" });

  } catch (err) {
    console.error("STOCK UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* =========================
   DELETE STOCK
========================= */
exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const before = await Stock.findByPk(id);
    if (!before) {
      return res.status(404).json({ message: "Stock not found" });
    }

    await StockHistory.create({
      stockId: id,
      itemId: before.itemId,
      action: "DELETE",
      qtyBefore: before.qty,
      qtyAfter: 0,
      buyingPriceBefore: before.buyingPrice,
      buyingPriceAfter: null
    });

    await Stock.destroy({
      where: { id }
    });

    res.json({ message: "Stock deleted" });

  } catch (err) {
    console.error("STOCK DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
