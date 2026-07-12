const express = require("express");
const controller = require("../controllers/vehicleController");

const router = express.Router();

router.route("/").post(controller.createVehicle).get(controller.getVehicles);
router.route("/:id").get(controller.getVehicleById).put(controller.updateVehicle).delete(controller.deleteVehicle);

module.exports = router;
