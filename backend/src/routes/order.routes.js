const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");
const controller = require("../controllers/order.controller");

router.get("/", auth, controller.getAll);
router.get("/:id", auth, controller.getOne);
router.get("/item-history/:itemId", auth, controller.getItemHistory);
router.post("/", auth, upload.single("billImage"), controller.create);
//router.put("/:id", auth, controller.update);
router.put("/:id", auth, upload.single("billImage"), controller.update);
router.delete("/:id", auth, controller.remove);
module.exports = router;
