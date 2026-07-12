const mongoose = require("mongoose");
const User = require("../models/User");

const PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function publicUser(user) {
  return { _id: user._id, company: user.company, name: user.name, email: user.email, phone: user.phone, employeeId: user.employeeId, roles: user.roles, isActive: user.isActive, createdBy: user.createdBy, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

function pagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || PAGE_SIZE, 1), MAX_PAGE_SIZE);
  return { page, limit, skip: (page - 1) * limit };
}

function errorResponse(error, res) {
  if (error.code === 11000) return res.status(409).json({ success: false, message: "Email or employee id already exists in this company.", data: null });
  if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ success: false, message: error.message, data: null });
  return res.status(500).json({ success: false, message: "An unexpected error occurred.", data: null });
}

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, employeeId, roles } = req.body;
    const user = await User.create({ company: req.user.company, name, email, password, phone, employeeId, roles, createdBy: req.user._id });
    return res.status(201).json({ success: true, message: "User created successfully.", data: publicUser(user) });
  } catch (error) {
    return errorResponse(error, res);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = { company: req.user.company };
    if (req.query.role) filter.roles = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
    if (req.query.search && req.query.search.trim()) {
      const expression = new RegExp(req.query.search.trim(), "i");
      filter.$or = [{ name: expression }, { email: expression }, { employeeId: expression }];
    }
    const [users, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), User.countDocuments(filter)]);
    return res.status(200).json({ success: true, message: "Users retrieved successfully.", data: users.map(publicUser), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return errorResponse(error, res);
  }
};

exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id.", data: null });
    const user = await User.findOne({ _id: req.params.id, company: req.user.company });
    if (!user) return res.status(404).json({ success: false, message: "User not found.", data: null });
    return res.status(200).json({ success: true, message: "User retrieved successfully.", data: publicUser(user) });
  } catch (error) {
    return errorResponse(error, res);
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id.", data: null });
    const allowedFields = ["name", "email", "password", "phone", "employeeId", "roles", "isActive"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    const user = await User.findOne({ _id: req.params.id, company: req.user.company });
    if (!user) return res.status(404).json({ success: false, message: "User not found.", data: null });
    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
      const duplicateEmail = await User.findOne({ email: updates.email, _id: { $ne: user._id } });
      if (duplicateEmail) return res.status(409).json({ success: false, message: "Email already exists.", data: null });
    }
    if (updates.employeeId) {
      updates.employeeId = updates.employeeId.toUpperCase().trim();
      const duplicateEmployeeId = await User.findOne({ company: req.user.company, employeeId: updates.employeeId, _id: { $ne: user._id } });
      if (duplicateEmployeeId) return res.status(409).json({ success: false, message: "Employee id already exists in this company.", data: null });
    }
    Object.assign(user, updates);
    await user.save();
    return res.status(200).json({ success: true, message: "User updated successfully.", data: publicUser(user) });
  } catch (error) {
    return errorResponse(error, res);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user id.", data: null });
    if (req.params.id === req.user._id.toString()) return res.status(409).json({ success: false, message: "You cannot deactivate your own account.", data: null });
    const user = await User.findOneAndUpdate({ _id: req.params.id, company: req.user.company }, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found.", data: null });
    return res.status(200).json({ success: true, message: "User deactivated successfully.", data: publicUser(user) });
  } catch (error) {
    return errorResponse(error, res);
  }
};
