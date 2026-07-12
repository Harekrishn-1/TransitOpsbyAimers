const mongoose = require("mongoose");

const holidayRequestSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"], default: "PENDING" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String, trim: true },
    reviewedAt: Date,
  },
  { timestamps: true }
);

holidayRequestSchema.index({ company: 1, driver: 1, status: 1, startDate: 1 });
holidayRequestSchema.pre("validate", function validateDates(next) { if (this.endDate < this.startDate) return next(new Error("End date cannot be before start date.")); next(); });

module.exports = mongoose.model("HolidayRequest", holidayRequestSchema);
