const mongoose = require("mongoose");

const fuelLogSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    filledAt: { type: Date, required: true, default: Date.now },
    liters: { type: Number, required: true, min: 0.01 },
    totalCost: { type: Number, required: true, min: 0 },
    odometerKm: { type: Number, required: true, min: 0 },
    fuelStation: { type: String, trim: true },
    receiptUrl: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

fuelLogSchema.index({ company: 1, vehicle: 1, filledAt: -1 });
fuelLogSchema.virtual("costPerLiter").get(function costPerLiter() { return this.liters ? this.totalCost / this.liters : 0; });
fuelLogSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("FuelLog", fuelLogSchema);
