const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/stock.controller");

router.use(auth);

router.get("/history", controller.getHistory);
router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
