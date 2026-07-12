import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    vehicleName: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["Truck", "Van", "Mini Truck", "Pickup", "Bus"],
      required: true,
    },

    maxLoadCapacity: {
      type: Number,
      required: true,
    },

    odometer: {
      type: Number,
      default: 0,
      min: 0,
    },

    acquisitionCost: {
      type: Number,
      required: true,
      min: 0,
    },

    region: String,

    status: {
      type: String,
      enum: ["Available", "On Trip", "In Shop", "Retired"],
      default: "Available",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
