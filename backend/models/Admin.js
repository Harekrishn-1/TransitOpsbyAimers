import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
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

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    designation: {
      type: String,
      default: "Fleet Admin",
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Optional — set when another admin creates this admin
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
