const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");
const { requireCompanyResource } = require("../utils/companyRelations");

const createMaintenance = async (req, res) => {
  try {
    const {
      vehicle,
      type,
      title,
      description,
      vendor,
      estimatedCost,
    } = req.body;

    await requireCompanyResource(Vehicle, vehicle, req.user.company, "Vehicle");

    const maintenance = await Maintenance.create({
      company: req.user.company,
      vehicle,
      type,
      title,
      description,
      vendor,
      estimatedCost,
      createdBy: req.user._id,
    });

    await Vehicle.findOneAndUpdate({ _id: vehicle, company: req.user.company }, {
      status: "IN_SHOP",
    });

    return res.status(201).json({
      success: true,
      message: "Maintenance created successfully",
      maintenance,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find({
      company: req.user.company,
    })
      .populate("vehicle", "registrationNumber name")
      .populate("createdBy", "name");

    return res.json({
      success: true,
      maintenance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findOne({ _id: req.params.id, company: req.user.company })
      .populate("vehicle")
      .populate("createdBy", "name");

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance not found",
      });
    }

    return res.json({
      success: true,
      maintenance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const allowedFields = ["type", "title", "description", "vendor", "estimatedCost", "actualCost", "openedAt"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));

    const maintenance = await Maintenance.findOneAndUpdate(
      {
        _id: req.params.id,
        company: req.user.company,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    return res.json({
      success: true,
      message: "Maintenance updated successfully",
      maintenance,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const closeMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    if (maintenance.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Maintenance already completed",
      });
    }

    maintenance.status = "COMPLETED";
    maintenance.closedAt = new Date();
    maintenance.closedBy = req.user._id;

    await maintenance.save();

    await Vehicle.findOneAndUpdate({ _id: maintenance.vehicle, company: req.user.company }, {
      status: "AVAILABLE",
    });

    return res.json({
      success: true,
      message: "Maintenance closed successfully",
      maintenance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    return res.json({
      success: true,
      message: "Maintenance deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceById,
  updateMaintenance,
  closeMaintenance,
  deleteMaintenance,
};
