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


router.post(
  "/",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  createMaintenance
);

router.get(
  "/",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  getAllMaintenance
);

router.get(
  "/:id",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  getMaintenanceById
);

router.put(
  "/:id",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  updateMaintenance
);

router.put(
  "/:id/close",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  closeMaintenance
);

router.delete(
  "/:id",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  deleteMaintenance
);

module.exports = router;