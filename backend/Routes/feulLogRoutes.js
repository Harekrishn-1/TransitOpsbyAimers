const express = require("express");
const router = express.Router();

const {
  createFuelLog,
  getAllFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} = require("../controllers/fuelLogController");

const isAuth = require("../middlewares/isAuth");
const authorize = require("../middlewares/authorize");


router.post(
  "/",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  createFuelLog
);

router.get(
  "/",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  getAllFuelLogs
);

router.get(
  "/:id",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  getFuelLogById
);

router.put(
  "/:id",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  updateFuelLog
);

router.delete(
  "/:id",
  isAuth,
  authorize("COMPANY_ADMIN", "FLEET_MANAGER"),
  deleteFuelLog
);

module.exports = router;