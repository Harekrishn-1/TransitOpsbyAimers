const mongoose = require("mongoose");
const { DRIVER_STATUSES } = require("./constants");

const driverSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contactNumber: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true, uppercase: true },
    licenseCategory: { type: String, required: true, trim: true },
    licenseExpiryDate: { type: Date, required: true },
    emergencyContact: { name: String, phone: String },
    safetyScore: { type: Number, min: 0, max: 100, default: 100 },
    status: { type: String, enum: DRIVER_STATUSES, default: "AVAILABLE" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

driverSchema.index({ company: 1, user: 1 }, { unique: true });
driverSchema.index({ company: 1, licenseNumber: 1 }, { unique: true });
driverSchema.index({ company: 1, status: 1 });
driverSchema.virtual("isLicenseExpired").get(function isLicenseExpired() { return this.licenseExpiryDate <= new Date(); });
driverSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Driver", driverSchema);
