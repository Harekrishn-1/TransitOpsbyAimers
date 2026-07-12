const express = require("express");
const controller = require("../controllers/vehicleController");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");
const { FLEET_MANAGEMENT_ROLES } = require("../models/constants");

const router = express.Router();
router.use(authenticate, authorizeRoles(...FLEET_MANAGEMENT_ROLES));

router.route("/").post(controller.createVehicle).get(controller.getVehicles);
router.route("/:id").get(controller.getVehicleById).put(controller.updateVehicle).delete(controller.deleteVehicle);

module.exports = router;
