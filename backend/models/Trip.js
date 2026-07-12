import mongoose from "mongoose";

const expenseCategoryEnum = [
  "Fuel",
  "Food",
  "Toll",
  "Lodging",
  "Maintenance",
  "Other",
];

const tripExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: expenseCategoryEnum,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: String,

    photos: {
      type: [String],
      default: [],
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    source: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    cargoWeight: {
      type: Number,
      min: 0,
    },

    plannedDistance: {
      type: Number,
      min: 0,
    },

    actualDistance: {
      type: Number,
      default: 0,
      min: 0,
    },

    fuelConsumed: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total budget allotted by admin for this trip
    allocatedBudget: {
      type: Number,
      required: true,
      min: 0,
    },

    // Optional category-wise budget split by admin
    allocatedCosts: {
      fuel: { type: Number, default: 0, min: 0 },
      food: { type: Number, default: 0, min: 0 },
      toll: { type: Number, default: 0, min: 0 },
      lodging: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 },
    },

    // Driver logs expenses during the trip (starts from 0, grows over time)
    expenses: {
      type: [tripExpenseSchema],
      default: [],
    },

    actualTotalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    exceedsBudget: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Draft", "Assigned", "In Progress", "Completed", "Cancelled"],
      default: "Draft",
    },

    dispatchDate: Date,
    completedDate: Date,

    // Admin reviews only when trip is completed and spend exceeds allocated budget
    budgetReview: {
      status: {
        type: String,
        enum: ["Not Required", "Pending", "Accepted", "Rejected"],
        default: "Not Required",
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      adminNotes: String,
      reviewedAt: Date,
    },
  },
  { timestamps: true }
);

tripSchema.pre("save", function syncBudgetFlags(next) {
  const expenses = this.expenses || [];
  this.actualTotalSpent = expenses.reduce(
    (total, entry) => total + (entry.amount || 0),
    0
  );

  this.exceedsBudget = this.actualTotalSpent > this.allocatedBudget;

  if (
    this.status === "Completed" &&
    this.exceedsBudget &&
    this.budgetReview.status === "Not Required"
  ) {
    this.budgetReview.status = "Pending";
  }

  if (!this.exceedsBudget && this.budgetReview.status === "Not Required") {
    this.budgetReview.status = "Not Required";
  }

  next();
});

export default mongoose.model("Trip", tripSchema);
