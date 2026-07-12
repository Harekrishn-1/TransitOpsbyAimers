import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },

    type: {
      type: String,
      enum: [
        "Fuel",
        "Maintenance",
        "Toll",
        "Insurance",
        "Other",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: String,

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);