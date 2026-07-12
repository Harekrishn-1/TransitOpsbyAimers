const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    type: { type: String, enum: ["PREVENTIVE", "REPAIR", "INSPECTION", "OTHER"], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    vendor: { type: String, trim: true },
    estimatedCost: { type: Number, min: 0 },
    actualCost: { type: Number, min: 0 },
    openedAt: { type: Date, default: Date.now },
    closedAt: Date,
    status: { type: String, enum: ["ACTIVE", "COMPLETED", "CANCELLED"], default: "ACTIVE" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

maintenanceSchema.index({ company: 1, vehicle: 1, status: 1 });
maintenanceSchema.index({ company: 1, vehicle: 1 }, { unique: true, partialFilterExpression: { status: "ACTIVE" } });

module.exports = mongoose.model("Maintenance", maintenanceSchema);
