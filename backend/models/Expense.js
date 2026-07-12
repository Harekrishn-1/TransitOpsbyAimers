const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    category: { type: String, enum: ["TOLL", "MAINTENANCE", "FOOD", "LODGING", "PARKING", "OTHER"], required: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, required: true, default: Date.now },
    description: { type: String, trim: true },
    receiptUrls: { type: [String], default: [] },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

expenseSchema.index({ company: 1, status: 1, expenseDate: -1 });
expenseSchema.index({ company: 1, vehicle: 1, category: 1, expenseDate: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
