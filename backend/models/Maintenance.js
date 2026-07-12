import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    issue: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: Date,

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);
