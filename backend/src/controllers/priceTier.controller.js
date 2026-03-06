const { PriceTier, PriceTierItem, Item } = require("../models");

exports.createTier = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    const tier = await PriceTier.create({ name, description });
    res.json(tier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listTiers = async (_req, res) => {
  const rows = await PriceTier.findAll({ order: [["name", "ASC"]] });
  res.json(rows);
};

exports.getTier = async (req, res) => {
  const id = Number(req.params.id);
  const tier = await PriceTier.findByPk(id, {
    include: [{ model: PriceTierItem, as: "items", include: [{ model: Item, as: "item" }] }]
  });
  if (!tier) return res.status(404).json({ message: "Not found" });
  res.json(tier);
};

exports.updateTier = async (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  const tier = await PriceTier.findByPk(id);
  if (!tier) return res.status(404).json({ message: "Not found" });
  await tier.update({ name, description });
  res.json(tier);
};

exports.deleteTier = async (req, res) => {
  const id = Number(req.params.id);
  const tier = await PriceTier.findByPk(id);
  if (!tier) return res.status(404).json({ message: "Not data found" });
  try {
    await tier.destroy();
    res.json({ message: "Tier Deletedc Successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Upsert an array of { itemId, sellingPrice }
exports.upsertTierItems = async (req, res) => {
  const id = Number(req.params.id);
  const bodyItems = Array.isArray(req.body) ? req.body : req.body.items;
  if (!Array.isArray(bodyItems)) return res.status(400).json({ message: "Items array required" });
  try {
    const ops = bodyItems.map(({ itemId, sellingPrice }) => ({
      priceTierId: id,
      itemId,
      sellingPrice
    }));

    // naive upsert using find/create/update for portability
    for (const op of ops) {
      const found = await PriceTierItem.findOne({ where: { priceTierId: id, itemId: op.itemId } });
      if (found) await found.update({ sellingPrice: op.sellingPrice });
      else await PriceTierItem.create(op);
    }
    res.json({ message: "Data Saved Successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Resolve price for a customer+item
exports.resolvePrice = async (req, res) => {
  const customerId = Number(req.query.customerId);
  const itemId = Number(req.query.itemId);
  if (!customerId || !itemId) return res.status(400).json({ message: "customerId and itemId required" });

  const { Customer } = require("../models");
  const customer = await Customer.findByPk(customerId);
  if (!customer || !customer.priceTierId) return res.status(404).json({ message: "No price tier set for customer" });

  const pti = await PriceTierItem.findOne({ where: { priceTierId: customer.priceTierId, itemId } });
  if (!pti) return res.status(404).json({ message: "No price configured for this item in customer's price tier" });
  res.json({ sellingPrice: Number(pti.sellingPrice) });
};
