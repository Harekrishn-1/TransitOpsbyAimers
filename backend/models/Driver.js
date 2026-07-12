import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    licenseCategory: {
      type: String,
      required: true,
    },

    licenseExpiryDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "On Trip", "On Leave", "Suspended"],
      default: "Available",
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);
