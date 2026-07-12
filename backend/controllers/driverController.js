const mongoose = require("mongoose");
const Driver = require("../models/Driver");
const User = require("../models/User");
const { handleDriverVehicleError } = require("./driverVehicleErrorHandler");

const PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function companyIdFrom(req) {
  const company = req.user && req.user.company;
  if (!company) throw Object.assign(new Error("Authenticated company context is required."), { statusCode: 401 });
  return company._id || company;
}

function pagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || PAGE_SIZE, 1), MAX_PAGE_SIZE);
  return { page, limit, skip: (page - 1) * limit };
}

function parseDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw Object.assign(new Error("licenseExpiryDate must be a valid date."), { statusCode: 400 });
  return date;
}

async function getDriverUser(userId, companyId) {
  if (!mongoose.isValidObjectId(userId)) throw Object.assign(new Error("A valid driver user id is required."), { statusCode: 400 });
  const user = await User.findOne({ _id: userId, company: companyId, isActive: true });
  if (!user) throw Object.assign(new Error("Driver user was not found in this company."), { statusCode: 400 });
}

exports.createDriver = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    const { user, contactNumber, licenseNumber, licenseCategory, licenseExpiryDate, emergencyContact, safetyScore, status } = req.body;
    await getDriverUser(user, company);
    const driver = await Driver.create({ company, user, contactNumber, licenseNumber, licenseCategory, licenseExpiryDate: parseDate(licenseExpiryDate), emergencyContact, safetyScore, status, createdBy: req.user._id });
    await driver.populate("user", "name email phone employeeId");
    res.status(201).json({ success: true, message: "Driver created successfully.", data: driver });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};

exports.getDrivers = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    const { page, limit, skip } = pagination(req.query);
    const filter = { company };
    const { search, status, licenseCategory, licenseExpired } = req.query;
    if (status) filter.status = status;
    if (licenseCategory) filter.licenseCategory = licenseCategory;
    if (licenseExpired === "true") filter.licenseExpiryDate = { $lt: new Date() };
    if (licenseExpired === "false") filter.licenseExpiryDate = { $gte: new Date() };
    if (search && search.trim()) {
      const expression = new RegExp(search.trim(), "i");
      const users = await User.find({ company, name: expression }).select("_id");
      filter.$or = [{ licenseNumber: expression }, { contactNumber: expression }, { user: { $in: users.map((entry) => entry._id) } }];
    }
    const [drivers, total] = await Promise.all([
      Driver.find(filter).populate("user", "name email phone employeeId").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Driver.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, message: "Drivers retrieved successfully.", data: drivers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid driver id.", data: null });
    const driver = await Driver.findOne({ _id: req.params.id, company }).populate("user", "name email phone employeeId");
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found.", data: null });
    res.status(200).json({ success: true, message: "Driver retrieved successfully.", data: driver });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid driver id.", data: null });
    const allowedFields = ["contactNumber", "licenseNumber", "licenseCategory", "licenseExpiryDate", "emergencyContact", "safetyScore", "status"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    if (Object.prototype.hasOwnProperty.call(updates, "licenseExpiryDate")) updates.licenseExpiryDate = parseDate(updates.licenseExpiryDate);
    if (updates.licenseNumber) {
      updates.licenseNumber = updates.licenseNumber.toUpperCase().trim();
      const duplicate = await Driver.findOne({ company, licenseNumber: updates.licenseNumber, _id: { $ne: req.params.id } });
      if (duplicate) return res.status(409).json({ success: false, message: "License number already exists in this company.", data: null });
    }
    const driver = await Driver.findOneAndUpdate({ _id: req.params.id, company }, updates, { new: true, runValidators: true }).populate("user", "name email phone employeeId");
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found.", data: null });
    res.status(200).json({ success: true, message: "Driver updated successfully.", data: driver });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid driver id.", data: null });
    const driver = await Driver.findOne({ _id: req.params.id, company });
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found.", data: null });
    if (driver.status === "ON_TRIP") return res.status(409).json({ success: false, message: "A driver on a trip cannot be deleted.", data: null });
    await driver.deleteOne();
    res.status(200).json({ success: true, message: "Driver deleted successfully.", data: null });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};
