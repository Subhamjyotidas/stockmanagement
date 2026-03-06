const {
  sequelize,
  Order,
  OrderItem,
  Customer,
  Item,
  Stock,
  StockMovement,
  OrderPayment,
  PriceTierItem
} = require("../models");
const { Op, literal } = require("sequelize");

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function uploadToServer(file) {
  const form = new FormData();
  form.append("file", fs.createReadStream(file.path));

  const response = await axios.post(
    "https://greenscornerschool.in/billUpload.php",
    form,
    { headers: form.getHeaders() }
  );

  return response.data.url; // public image URL
}

exports.create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const customerId = Number(req.body.customerId);
    if (!customerId) throw new Error("Customer required");

    const exists = await Order.findOne({ where: { billNo: req.body.billNo } });
    if (exists) throw new Error("Bill number already exists");

    const items = JSON.parse(req.body.items || "[]");
    if (!items.length) throw new Error("Items required");

    const customer = await Customer.findByPk(customerId);

    let totalAmount = 0;

    // ✅ Upload image to GoDaddy server
    let billImageUrl = null;
    if (req.file) {
      billImageUrl = await uploadToServer(req.file);
    }

    const order = await Order.create({
      customerId,
      billNo: req.body.billNo,
      billDate: req.body.billDate,
      comments: req.body.comments || null,
      billImage: billImageUrl,
      totalAmount: 0
    }, { transaction: t });

    for (const it of items) {
      const qty = Number(it.qty);
      let sellingPrice = Number(it.sellingPrice);
      if ((!sellingPrice || isNaN(sellingPrice)) && customer?.priceTierId) {
        const tierItem = await PriceTierItem.findOne({ where: { priceTierId: customer.priceTierId, itemId: it.itemId } });
        if (!tierItem) {
          throw new Error(`No price configured for item ${it.itemId} in customer's price tier`);
        }
        sellingPrice = Number(tierItem.sellingPrice);
      }
      totalAmount += qty * sellingPrice;

      const stock = await Stock.findOne({
        where: {
          itemId: it.itemId,
          buyingPrice: it.buyingPrice
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (!stock || stock.qty < qty) {
        throw new Error(`Insufficient stock for item ${it.itemId} selling price ${it.sellingPrice}`);
      }

      await Stock.update(
        { qty: sequelize.literal(`ROUND(qty - ${qty}, 6)`) },
        { where: { itemId: it.itemId, buyingPrice: it.buyingPrice }, transaction: t }
      );

      await OrderItem.create({
        orderId: order.id,
        itemId: it.itemId,
        buyingPrice: it.buyingPrice,
        sellingPrice: sellingPrice,
        qty
      }, { transaction: t });

      await StockMovement.create({
        itemId: it.itemId,
        orderId: order.id,
        type: "OUT",
        qty,
        reason: "Order created"
      }, { transaction: t });
    }

    await order.update({ totalAmount }, { transaction: t });

    await t.commit();
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error("Temp file delete failed", err);
      });
    }
    res.json({ message: "Order created", orderId: order.id });

  } catch (err) {
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
};


exports.getAll = async (req, res) => {
  const search = req.query.search || "";
  const page = Number(req.query.page || 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const paymentStatus = req.query.paymentStatus ? req.query.paymentStatus.split(',') : [];

  // Build WHERE conditions
  let whereClause = "WHERE 1=1";
  if (search) {
    whereClause += ` AND (o.billNo LIKE '%${search}%' OR c.name LIKE '%${search}%')`;
  }
  
if (paymentStatus.length > 0) {
  const statusConditions = paymentStatus.map(status => {
    switch(status) {
      case 'paid': return `(
        o.totalAmount > 0 AND 
        IFNULL((SELECT SUM(amount + IFNULL(discountAmount, 0)) FROM order_payments WHERE orderId = o.id), 0) >= o.totalAmount
      )`;
      case 'partial': return `(
        IFNULL((SELECT SUM(amount + IFNULL(discountAmount, 0)) FROM order_payments WHERE orderId = o.id), 0) > 0 AND 
        IFNULL((SELECT SUM(amount + IFNULL(discountAmount, 0)) FROM order_payments WHERE orderId = o.id), 0) < o.totalAmount
      )`;
      case 'unpaid': return `(
        IFNULL((SELECT SUM(amount + IFNULL(discountAmount, 0)) FROM order_payments WHERE orderId = o.id), 0) = 0 OR 
        IFNULL((SELECT SUM(amount + IFNULL(discountAmount, 0)) FROM order_payments WHERE orderId = o.id), 0) < o.totalAmount
      )`;
      default: return '';
    }
  }).filter(condition => condition !== '');
  
  if (statusConditions.length > 0) {
    whereClause += ` AND (${statusConditions.join(' OR ')})`;
  }
}

  // Main query with pagination
  const sql = `
    SELECT 
      o.*,
      c.name AS customer_name,
      IFNULL(paid.total, 0) AS paidAmount,
      o.totalAmount - IFNULL(paid.total, 0) AS dueAmount,
      IFNULL(profit.total, 0) AS totalProfit
    FROM orders o
    LEFT JOIN customer c ON o.customerId = c.id
    LEFT JOIN (
      SELECT orderId, SUM(amount + IFNULL(discountAmount, 0)) AS total
      FROM order_payments 
      GROUP BY orderId
    ) paid ON o.id = paid.orderId
    LEFT JOIN (
      SELECT orderId, SUM((sellingPrice - buyingPrice) * qty) AS total
      FROM order_items 
      GROUP BY orderId
    ) profit ON o.id = profit.orderId
    ${whereClause}
    ORDER BY o.id DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Count query
  const countSql = `
    SELECT COUNT(*) as total 
    FROM orders o
    LEFT JOIN customer c ON o.customerId = c.id
    ${whereClause}
  `;

  try {
    const rows = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
    const countResult = await sequelize.query(countSql, { type: sequelize.QueryTypes.SELECT });
    
    // Handle both single object and array cases
    const rowsArray = Array.isArray(rows) ? rows : [rows];
    const total = countResult[0]?.total || 0;

    const data = rowsArray.map(o => {
      const totalAmount = Number(o.totalAmount) || 0;
      const paidAmount = Number(o.paidAmount) || 0;
      const dueAmount = Math.max(totalAmount - paidAmount, 0);
      const totalProfit = Number(o.totalProfit) || 0;
      
      let status = "unpaid";
      if (paidAmount > 0 && dueAmount > 0) status = "partial";
      if (dueAmount === 0 && totalAmount > 0) status = "paid";

      return {
        id: o.id,
        customerId: o.customerId,
        billNo: o.billNo,
        billDate: o.billDate,
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        dueAmount: dueAmount,
        paymentStatus: status,
        billImage: o.billImage,
        comments: o.comments,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        customer: {
          id: o.customerId,
          name: o.customer_name
        },
        totalProfit: Number(totalProfit.toFixed(2))
      };
    });

    res.json({
      data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ message: err.message });
  }
};
exports.getOne = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid order id" });

  const order = await Order.findByPk(id, {
    include: [
      { model: Customer, as: "customer" },
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Item, as: "item" }]
      }
    ]
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // 🔹 CALCULATE TOTAL PROFIT
  let totalProfit = 0;

  order.items.forEach(i => {
    const buying = Number(i.buyingPrice);
    const selling = Number(i.sellingPrice);
    const qty = Number(i.qty);

    totalProfit += (selling - buying) * qty;
  });

  res.json({
    ...order.toJSON(),
    totalProfit: Number(totalProfit.toFixed(2))
  });
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  const id = Number(req.params.id);
  try {
    const items = JSON.parse(req.body.items || "[]");

    const orderHeader = await Order.findByPk(id);
    if (!orderHeader) { throw new Error("Order not found"); }
    const customer = await Customer.findByPk(orderHeader.customerId);

    // 🔹 Fetch existing items
    const oldItems = await OrderItem.findAll({
      where: { orderId: id },
      transaction: t
    });


    // 🔹 REVERT stock
    for (const it of oldItems) {

      await Stock.update(
        { qty: sequelize.literal(`ROUND(qty + ${it.qty}, 6)`) },

        { where: { itemId: it.itemId, buyingPrice: it.buyingPrice }, transaction: t }
      );
    }
    // 🔹 Delete old order items
    await OrderItem.destroy({ where: { orderId: id }, transaction: t });

    let totalAmount = 0;

    // 🔹 Apply new items
    for (const it of items) {
      const qty = Number(it.qty);
      let sellingPrice = Number(it.sellingPrice);
      if ((!sellingPrice || isNaN(sellingPrice)) && customer?.priceTierId) {
        const tierItem = await PriceTierItem.findOne({ where: { priceTierId: customer.priceTierId, itemId: it.itemId } });
        if (!tierItem) {
          throw new Error(`No price configured for item ${it.itemId} in customer's price tier`);
        }
        sellingPrice = Number(tierItem.sellingPrice);
      }

      totalAmount += qty * sellingPrice;

      const stock = await Stock.findOne({
        where: { itemId: it.itemId, buyingPrice: it.buyingPrice },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!stock || stock.qty < qty) {
        throw new Error("Insufficient stock");
      }

      await Stock.update(
        { qty: sequelize.literal(`ROUND(qty - ${qty}, 6)`) },
        { where: { itemId: it.itemId, buyingPrice: it.buyingPrice }, transaction: t }
      );

      await OrderItem.create(
        {
          orderId: id,
          itemId: it.itemId,
          buyingPrice: it.buyingPrice,
          sellingPrice: sellingPrice,
          qty
        },
        { transaction: t }
      );

      await StockMovement.create(
        {
          itemId: it.itemId,
          orderId: id,
          type: "OUT",
          qty,
          reason: "Order updated"
        },
        { transaction: t }
      );
    }

    // 🔹 Update header
    await Order.update({
      billNo: req.body.billNo,
      billDate: req.body.billDate,
      comments: req.body.comments || null,
      billImage: req.file ? req.file.filename : undefined,
      totalAmount
    }, { where: { id }, transaction: t });

    await t.commit();
    res.json({ message: "Order updated" });

  } catch (err) {
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
};
exports.remove = async (req, res) => {
  const t = await sequelize.transaction();
  const id = Number(req.params.id);

  try {
    const items = await OrderItem.findAll({
      where: { orderId: id },
      transaction: t
    });

    // 🔹 Restore stock
    for (const it of items) {
      await Stock.increment(
        { qty: it.qty },
        { where: { itemId: it.itemId, buyingPrice: it.buyingPrice }, transaction: t }
      );
      await StockMovement.create({
        itemId: it.itemId,
        orderId: id,
        type: "IN",
        qty: it.qty,
        reason: "Order deleted"
      });
    }

    // 🔹 Delete order (CASCADE removes items)
    await Order.destroy({ where: { id }, transaction: t });

    await t.commit();
    res.json({ message: "Order deleted" });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};
exports.getItemHistory = async (req, res) => {
  const itemId = Number(req.params.itemId);

  if (!itemId) {
    return res.status(400).json({ message: "Invalid item id" });
  }

  try {
    const rows = await OrderItem.findAll({
      where: { itemId },
      include: [
        {
          model: Order,
          include: [{ model: Customer, as: "customer" }]
        }
      ],
      order: [[Order, "billDate", "DESC"]]
    });

    const data = rows.map(oi => {
      const order = oi.Order;
      return {
        orderId: oi.orderId,
        billNo: order?.billNo,
        billDate: order?.billDate,
        customerName: order?.customer?.name || "",
        qty: Number(oi.qty),
        sellingPrice: Number(oi.sellingPrice),
        lineTotal: Number(oi.qty) * Number(oi.sellingPrice)
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
