const express = require("express");
const controller = require("../controllers/driverController");

const router = express.Router();

router.route("/").post(controller.createDriver).get(controller.getDrivers);
router.route("/:id").get(controller.getDriverById).put(controller.updateDriver).delete(controller.deleteDriver);

module.exports = router;
