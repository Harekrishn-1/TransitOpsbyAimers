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
const { FLEET_MANAGEMENT_ROLES, TRIP_VIEW_ROLES } = require("../models/constants");

// All trip routes require a logged-in user
router.use(protect);

// Roles allowed to manage trips — adjust to match your team's final role list
router
  .route("/")
  .post(authorize(...FLEET_MANAGEMENT_ROLES), createTrip)
  .get(authorize(...TRIP_VIEW_ROLES), getTrips);

router
  .route("/:id")
  .get(authorize(...TRIP_VIEW_ROLES), getTripById)
  .put(authorize(...FLEET_MANAGEMENT_ROLES), updateTrip);

router.post("/:id/dispatch", authorize(...FLEET_MANAGEMENT_ROLES), dispatchTrip);
router.post("/:id/complete", authorize(...FLEET_MANAGEMENT_ROLES), completeTrip);
router.post("/:id/cancel", authorize(...FLEET_MANAGEMENT_ROLES), cancelTrip);

module.exports = router;
