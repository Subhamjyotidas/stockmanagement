const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/priceTier.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, ctrl.createTier);
router.get("/", auth, ctrl.listTiers);
router.get("/:id", auth, ctrl.getTier);
router.put("/:id", auth, ctrl.updateTier);
router.delete("/:id", auth, ctrl.deleteTier);
router.put("/:id/items", auth, ctrl.upsertTierItems);

// Helper endpoint to resolve a price for UI
router.get("/pricing/resolve", auth, ctrl.resolvePrice);

module.exports = router;
