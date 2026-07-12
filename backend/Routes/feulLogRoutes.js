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
const { FLEET_MANAGEMENT_ROLES } = require("../models/constants");


router.post(
  "/",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  createFuelLog
);

router.get(
  "/",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  getAllFuelLogs
);

router.get(
  "/:id",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  getFuelLogById
);

router.put(
  "/:id",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  updateFuelLog
);

router.delete(
  "/:id",
  isAuth,
  authorize(...FLEET_MANAGEMENT_ROLES),
  deleteFuelLog
);

module.exports = router;
