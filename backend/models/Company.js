const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

companySchema.index({ registrationNumber: 1 }, { unique: true });
companySchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Company", companySchema);
