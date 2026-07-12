const express = require("express");
const controller = require("../controllers/driverController");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");
const { FLEET_MANAGEMENT_ROLES } = require("../models/constants");

const router = express.Router();
router.use(authenticate, authorizeRoles(...FLEET_MANAGEMENT_ROLES));

router.route("/").post(controller.createDriver).get(controller.getDrivers);
router.route("/:id").get(controller.getDriverById).put(controller.updateDriver).delete(controller.deleteDriver);

module.exports = router;
