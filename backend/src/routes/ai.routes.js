const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");

// Sales Forecasting
router.get("/sales-forecast", aiController.getSalesForecast);

// Stock Alerts
router.get("/stock-alerts", aiController.getStockAlerts);

// Customer Insights
router.get("/customer-insights", aiController.getCustomerInsights);

// Profit Insights
router.get("/profit-insights", aiController.getProfitInsights);

// Business Trends
router.get("/business-trends", aiController.getBusinessTrends);

// Quick Stats
router.get("/quick-stats", aiController.getQuickStats);

module.exports = router;

