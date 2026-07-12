import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Driver"],
      required: true,
    },

    // Linked profile based on role
    adminProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    driverProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },

    phone: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
