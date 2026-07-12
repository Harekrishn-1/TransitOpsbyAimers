const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
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

exports.createVehicle = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    const { registrationNumber, make, model, maximumLoadCapacityKg, odometerKm, acquisitionCost, acquisitionDate, region, status } = req.body;
    const { name, type } = req.body;
    const vehicle = await Vehicle.create({ company, registrationNumber, name, make, model, type, maximumLoadCapacityKg, odometerKm, acquisitionCost, acquisitionDate, region, status, createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Vehicle created successfully.", data: vehicle });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    const { page, limit, skip } = pagination(req.query);
    const filter = { company };
    const { search, status, type, region } = req.query;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (region) filter.region = region;
    if (search && search.trim()) {
      const expression = new RegExp(search.trim(), "i");
      filter.$or = [{ registrationNumber: expression }, { name: expression }, { model: expression }];
    }
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Vehicle.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, message: "Vehicles retrieved successfully.", data: vehicles, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid vehicle id.", data: null });
    const vehicle = await Vehicle.findOne({ _id: req.params.id, company });
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found.", data: null });
    res.status(200).json({ success: true, message: "Vehicle retrieved successfully.", data: vehicle });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid vehicle id.", data: null });
    const allowedFields = ["registrationNumber", "name", "make", "model", "type", "maximumLoadCapacityKg", "odometerKm", "acquisitionCost", "acquisitionDate", "region", "status"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    if (updates.registrationNumber) {
      updates.registrationNumber = updates.registrationNumber.toUpperCase().trim();
      const duplicate = await Vehicle.findOne({ company, registrationNumber: updates.registrationNumber, _id: { $ne: req.params.id } });
      if (duplicate) return res.status(409).json({ success: false, message: "Vehicle registration number already exists in this company.", data: null });
    }
    const vehicle = await Vehicle.findOneAndUpdate({ _id: req.params.id, company }, updates, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found.", data: null });
    res.status(200).json({ success: true, message: "Vehicle updated successfully.", data: vehicle });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const company = companyIdFrom(req);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid vehicle id.", data: null });
    const vehicle = await Vehicle.findOne({ _id: req.params.id, company });
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found.", data: null });
    if (["ON_TRIP", "IN_SHOP"].includes(vehicle.status)) return res.status(409).json({ success: false, message: "A vehicle on a trip or in the shop cannot be deleted.", data: null });
    await vehicle.deleteOne();
    res.status(200).json({ success: true, message: "Vehicle deleted successfully.", data: null });
  } catch (error) {
    handleDriverVehicleError(error, res);
  }
};
