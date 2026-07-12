const express = require("express");
const router = express.Router();

const {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceById,
  updateMaintenance,
  closeMaintenance,
  deleteMaintenance,
} = require("../controllers/maintenanceController");

const isAuth = require("../middlewares/isAuth");
const authorize = require("../middlewares/authorize");
const { FLEET_MANAGEMENT_ROLES } = require("../models/constants");


router.post(
  "/",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  createMaintenance
);

router.get(
  "/",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  getAllMaintenance
);

router.get(
  "/:id",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  getMaintenanceById
);

router.put(
  "/:id",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  updateMaintenance
);

router.put(
  "/:id/close",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  closeMaintenance
);

router.delete(
  "/:id",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  deleteMaintenance
);

module.exports = router;
