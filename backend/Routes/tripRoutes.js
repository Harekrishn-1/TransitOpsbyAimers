const express = require("express");
const router = express.Router();

const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} = require("../controllers/tripController");

const { protect, authorize } = require("../middlewares/auth");

// All trip routes require a logged-in user
router.use(protect);

// Roles allowed to manage trips — adjust to match your team's final role list
const CAN_MANAGE_TRIPS = ["COMPANY_ADMIN", "FLEET_MANAGER"];

router
  .route("/")
  .post(authorize(...CAN_MANAGE_TRIPS), createTrip)
  .get(authorize(...CAN_MANAGE_TRIPS, "SAFETY_OFFICER", "FINANCIAL_ANALYST"), getTrips);

router
  .route("/:id")
  .get(authorize(...CAN_MANAGE_TRIPS, "SAFETY_OFFICER", "FINANCIAL_ANALYST"), getTripById)
  .put(authorize(...CAN_MANAGE_TRIPS), updateTrip);

router.post("/:id/dispatch", authorize(...CAN_MANAGE_TRIPS), dispatchTrip);
router.post("/:id/complete", authorize(...CAN_MANAGE_TRIPS), completeTrip);
router.post("/:id/cancel", authorize(...CAN_MANAGE_TRIPS), cancelTrip);

module.exports = router;