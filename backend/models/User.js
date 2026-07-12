const mongoose = require("mongoose");
const { USER_ROLES } = require("./constants");
const { hashPassword, comparePassword } = require("../utils/password");

const userSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 12, maxlength: 128, select: false },
    phone: { type: String, trim: true },
    employeeId: { type: String, trim: true, uppercase: true },
    roles: { type: [{ type: String, enum: USER_ROLES }], required: true, validate: [(roles) => roles.length > 0, "At least one role is required"] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ company: 1, employeeId: 1 }, { unique: true, sparse: true });
userSchema.index({ company: 1, roles: 1 });

userSchema.pre("save", async function hashUserPassword() {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = function compareUserPassword(password) {
  return comparePassword(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
