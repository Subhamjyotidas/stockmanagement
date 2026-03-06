require("./models");
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

const app = express();

/* ===== GLOBAL MIDDLEWARE ===== */
// Permissive CORS for local dev: allow localhost/127.0.0.1 any port
const localhostRegex = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (localhostRegex.some(re => re.test(origin))) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
  preflightContinue: false
}));

// Explicitly handle preflight for all routes
app.options("*", cors());
// app.use((req, res, next) => {
//   if (req.body && typeof req.body === "object") {
//     delete req.body.id;
//     delete req.body.ID;
//   }
//   next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== ROUTES ===== */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/items", require("./routes/item.routes"));
app.use("/api/stock", require("./routes/stock.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/order-payments", require("./routes/orderPayment.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/payment-history", require("./routes/paymentHistory.routes"));
app.use("/api/buyer-payments", require("./routes/buyerPayment.routes"));
app.use("/api/voucher", require("./routes/voucher.routes"));
app.use("/api/price-tiers", require("./routes/priceTier.routes"));

/* ===== HEALTH CHECK ===== */
app.get("/", (req, res) => {
  res.json({ status: "Admin Panel backend running" });
});

/* ===== ERROR HANDLER ===== */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ===== DB CONNECT ===== */
sequelize.authenticate()
  .then(() => console.log("MySQL connected"))
  .catch(err => console.error("MySQL connection failed:", err));

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("Database connected");

//     await sequelize.sync({ alter: true }); 
//     // or force: true (see below)

//     console.log("All models were synchronized successfully.");
//   } catch (error) {
//     console.error("DB sync failed:", error);
//   }
// })();

module.exports = app;
