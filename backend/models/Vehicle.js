const mongoose = require("mongoose");
const { VEHICLE_STATUSES } = require("./constants");

const vehicleSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    make: { type: String, trim: true },
    model: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    maximumLoadCapacityKg: { type: Number, required: true, min: 0 },
    odometerKm: { type: Number, default: 0, min: 0 },
    acquisitionCost: { type: Number, required: true, min: 0 },
    acquisitionDate: Date,
    region: { type: String, trim: true },
    status: { type: String, enum: VEHICLE_STATUSES, default: "AVAILABLE" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ company: 1, registrationNumber: 1 }, { unique: true });
vehicleSchema.index({ company: 1, status: 1, type: 1, region: 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);
