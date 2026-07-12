const mongoose = require("mongoose");
const { TRIP_STATUSES } = require("./constants");

const tripSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    tripNumber: { type: String, required: true, trim: true, uppercase: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    cargoWeightKg: { type: Number, required: true, min: 0 },
    plannedDistanceKm: { type: Number, required: true, min: 0 },
    actualDistanceKm: { type: Number, min: 0 },
    dispatchOdometerKm: { type: Number, min: 0 },
    completionOdometerKm: { type: Number, min: 0 },
    plannedStartAt: Date,
    dispatchedAt: Date,
    completedAt: Date,
    status: { type: String, enum: TRIP_STATUSES, default: "DRAFT" },
    revenue: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

tripSchema.index({ company: 1, tripNumber: 1 }, { unique: true });
tripSchema.index({ company: 1, status: 1, vehicle: 1, driver: 1 });
tripSchema.index({ company: 1, vehicle: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "DISPATCHED" } });
tripSchema.index({ company: 1, driver: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "DISPATCHED" } });

tripSchema.pre("validate", function validateOdometer(next) {
  if (this.completionOdometerKm != null && this.dispatchOdometerKm != null && this.completionOdometerKm < this.dispatchOdometerKm) {
    return next(new Error("Completion odometer cannot be less than dispatch odometer."));
  }
  next();
});

module.exports = mongoose.model("Trip", tripSchema);
