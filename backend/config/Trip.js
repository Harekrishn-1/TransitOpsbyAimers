import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    source: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    cargoWeight: {
      type: Number,
      required: true,
    },

    plannedDistance: {
      type: Number,
      required: true,
    },

    actualDistance: {
      type: Number,
      default: 0,
    },

    fuelConsumed: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Dispatched", "Completed", "Cancelled"],
      default: "Draft",
    },

    dispatchDate: Date,

    completedDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);