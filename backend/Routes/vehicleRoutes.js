const express = require("express");
const controller = require("../controllers/vehicleController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authorizeRoles("COMPANY_ADMIN", "FLEET_MANAGER"));

router.route("/").post(controller.createVehicle).get(controller.getVehicles);
router.route("/:id").get(controller.getVehicleById).put(controller.updateVehicle).delete(controller.deleteVehicle);

module.exports = router;
